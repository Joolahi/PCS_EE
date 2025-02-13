from flask import Blueprint, request, jsonify
from App.extensions.db import get_collection, get_collection_efficiency
import math
import datetime
import pytz
from bson.objectid import ObjectId
import re

efficiency_bp = Blueprint("efficiency", __name__)
collection = get_collection()
efficiency_collection = get_collection_efficiency()
FINLAND_TZ = pytz.timezone("Europe/Helsinki")


def clean_nan_values(data):
    """
    Recursively replace NaN values with None in a dictionary or list.
    """
    if isinstance(data, list):
        return [clean_nan_values(item) for item in data]
    elif isinstance(data, dict):
        return {
            key: (
                None
                if isinstance(value, float) and math.isnan(value)
                else clean_nan_values(value)
            )
            for key, value in data.items()
        }
    return data


def convert_objectid_to_str(data):
    """
    Recursively convert ObjectId fields to strings in a dictionary or list.
    """
    if isinstance(data, list):
        return [convert_objectid_to_str(item) for item in data]
    elif isinstance(data, dict):
        return {
            key: (
                str(value)
                if isinstance(value, ObjectId)
                else convert_objectid_to_str(value)
            )
            for key, value in data.items()
        }
    return data


@efficiency_bp.route("/efficiency", methods=["POST"])
def create_efficiency_summary():
    """
    Create or update the efficiency summary when weekly work hours are provided.
    """
    try:
        # Parse the request for weekly hours
        data = request.get_json()
        weekly_hours = data.get("weekly_hours")

        if not weekly_hours or not isinstance(weekly_hours, (int, float)):
            return (
                jsonify({"error": "weekly_hours is required and must be a number"}),
                400,
            )

        now = datetime.datetime.now(FINLAND_TZ)
        current_week = now.isocalendar()[1]
        current_year = now.year

        is_after_friday_1730 = now.weekday() > 4 or (
            now.weekday() == 4 and now.hour >= 17 and now.minute >= 30
        )
        if is_after_friday_1730:
            next_week = current_week + 1
            if next_week > 52:
                next_week = 1
                current_year += 1
            summary_name = f"KokkolaEfficiency_Week{next_week}"
        else:
            summary_name = f"KokkolaEfficiency_Week{current_week}"

        # Filter documents where Osasto is 300 or 400
        items = list(collection.find({"Osasto": {"$in": [300, 400]}}))
        if not items:
            return jsonify({"error": "No data found for osasto 300 or 400"}), 404

        # Prepare summary document
        current_week = datetime.datetime.now(FINLAND_TZ).isocalendar()[1]
        summary_name = f"KokkolaEfficiency_Week{current_week}"

        total_kpl_std_ajalla = 0
        total_kpl_target_ajalla = 0

        processed_items = []
        for item in items:
            updates = {}
            total_made = item.get("total_made", 0)
            quantity = item.get("Quantity", 0)
            standardiaika = item.get("Standardiaika", 0)

            status = item.get("Status", None)
            if status is not None:
                updates["Status"] = status
            # Calculate KPL STD ajalla
            if total_made and standardiaika:
                kpl_std_ajalla = round(float(total_made) * float(standardiaika), 2)
                updates["KPL STD ajalla"] = kpl_std_ajalla
                total_kpl_std_ajalla += kpl_std_ajalla

            # Calculate KPL STD ajalla TARGET
            if quantity and standardiaika:
                kpl_target_ajalla = round(float(quantity) * float(standardiaika), 2)
                updates["KPL STD ajalla TARGET"] = kpl_target_ajalla
                total_kpl_target_ajalla += kpl_target_ajalla

            # Update the document with the calculated fields
            if updates:
                collection.update_one({"_id": item["_id"]}, {"$set": updates})
                item.update(updates)

            item["_id"] = str(item["_id"])  # Convert ObjectId to string
            processed_items.append(clean_nan_values(item))  # Clean NaN values

        # Calculate Efficiency NOW and TARGET
        efficiency_now = (
            round(total_kpl_std_ajalla / weekly_hours, 2) if weekly_hours else None
        )
        efficiency_target = (
            round(total_kpl_target_ajalla / weekly_hours, 2) if weekly_hours else None
        )

        # Save the summary document
        summary_document = {
            "summary_name": summary_name,
            "viikon_tyotunnit": weekly_hours,
            "EFFICIENCY NOW": efficiency_now,
            "EFFICIENCY TARGET": efficiency_target,
            "total_kpl_std_ajalla": total_kpl_std_ajalla,
            "total_kpl_target_ajalla": total_kpl_target_ajalla,
            "items": processed_items,
            "updated_at": datetime.datetime.now(FINLAND_TZ),
        }

        # Use upsert to update the summary if it already exists
        efficiency_collection.update_one(
            {"summary_name": summary_name}, {"$set": summary_document}, upsert=True
        )

        return (
            jsonify(
                {
                    "message": "Efficiency summary created/updated successfully.",
                    "summary": summary_document,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Error in create_efficiency_summary: {str(e)}")
        return jsonify({"error": str(e)}), 500


@efficiency_bp.route("/efficiency", methods=["GET"])
def get_efficiency_summary():
    try:
        current_week = datetime.datetime.now(FINLAND_TZ).isocalendar()[1]
        summary_name = f"KokkolaEfficiency_Week{current_week}"

        # Fetch existing summary
        existing_summary = efficiency_collection.find_one(
            {"summary_name": summary_name}
        )

        # Fetch documents where Osasto is 300 or 400
        items = list(collection.find({"Osasto": {"$in": [300, 400]}}))
        if not items:
            return jsonify({"error": "No data found for osasto 300 or 400"}), 404

        weekly_hours = (
            existing_summary.get("viikon_tyotunnit", 0) if existing_summary else 0
        )
        if weekly_hours == 0:
            return (
                jsonify({"error": "Weekly hours not set. Add weekly hours first."}),
                400,
            )

        total_kpl_std_ajalla = 0
        total_kpl_target_ajalla = 0
        processed_items = []

        for item in items:
            updates = {}
            total_made = item.get("total_made", 0)
            quantity = item.get("Quantity", 0)
            standardiaika = item.get("Standardiaika", 0)

            # Check if this item already exists in the summary
            existing_item = next(
                (i for i in existing_summary["items"] if i["_id"] == str(item["_id"])),
                None,
            )

            # Preserve Status from the existing item
            status = existing_item.get("Status", None) if existing_item else None
            if status is not None:
                updates["Status"] = status

            # Recalculate fields if necessary
            if total_made and standardiaika:
                kpl_std_ajalla = round(float(total_made) * float(standardiaika), 2)
                if (
                    existing_item
                    and existing_item.get("KPL STD ajalla") != kpl_std_ajalla
                ):
                    updates["KPL STD ajalla"] = kpl_std_ajalla
                total_kpl_std_ajalla += kpl_std_ajalla

            if quantity and standardiaika:
                kpl_target_ajalla = round(float(quantity) * float(standardiaika), 2)
                if (
                    existing_item
                    and existing_item.get("KPL STD ajalla TARGET") != kpl_target_ajalla
                ):
                    updates["KPL STD ajalla TARGET"] = kpl_target_ajalla
                total_kpl_target_ajalla += kpl_target_ajalla

            # Only update the document if changes are detected
            if updates:
                collection.update_one({"_id": item["_id"]}, {"$set": updates})
                item.update(updates)

            item["_id"] = str(item["_id"])  # Convert ObjectId to string for JSON
            processed_items.append(clean_nan_values(item))  # Clean NaN values

        # Calculate Efficiency NOW and TARGET
        efficiency_now = (
            round(total_kpl_std_ajalla / weekly_hours, 2) if weekly_hours else None
        )
        efficiency_target = (
            round(total_kpl_target_ajalla / weekly_hours, 2) if weekly_hours else None
        )

        # Update only changed fields in the summary document
        summary_updates = {
            "EFFICIENCY NOW": efficiency_now,
            "EFFICIENCY TARGET": efficiency_target,
            "total_kpl_std_ajalla": total_kpl_std_ajalla,
            "total_kpl_target_ajalla": total_kpl_target_ajalla,
            "updated_at": datetime.datetime.now(FINLAND_TZ),
        }

        if "items" in existing_summary:
            summary_updates["items"] = processed_items  # Update items array

        efficiency_collection.update_one(
            {"summary_name": summary_name}, {"$set": summary_updates}, upsert=True
        )

        # Return the updated summary document
        updated_summary = efficiency_collection.find_one({"summary_name": summary_name})
        return jsonify(convert_objectid_to_str(updated_summary)), 200

    except Exception as e:
        print(f"Error in get_efficiency_summary: {str(e)}")
        return jsonify({"error": str(e)}), 500


@efficiency_bp.route("/efficiencyStatus", methods=["POST"])
def update_efficiency_status():
    try:
        # Parse the request data
        data = request.get_json()
        summary_id = data.get("summaryId")
        item_id = data.get("itemId")
        new_status = data.get("newStatus")

        if not summary_id or not item_id or not new_status:
            return (
                jsonify(
                    {"error": "Missing required fields: summaryId, itemId, newStatus"}
                ),
                400,
            )

        # Debugging: Log incoming data
        print(
            f"Received data: summary_id={summary_id}, item_id={item_id}, new_status={new_status}"
        )

        # Find the summary document
        summary = efficiency_collection.find_one({"_id": ObjectId(summary_id)})

        # Debugging: Log the summary document
        print(f"Found summary document: {summary}")

        if not summary:
            return jsonify({"error": "Summary not found."}), 404

        # Update the status in the items array
        updated = efficiency_collection.update_one(
            {"_id": ObjectId(summary_id), "items._id": item_id},
            {"$set": {"items.$.Status": new_status}},
        )

        # Debugging: Log the update result
        print(
            f"Matched count: {updated.matched_count}, Modified count: {updated.modified_count}"
        )

        if updated.matched_count == 0:
            return jsonify({"error": "No matching item found in summary."}), 404
        elif updated.modified_count == 0:
            return (
                jsonify(
                    {
                        "message": "No changes were made. Status might already be the desired value."
                    }
                ),
                200,
            )

        return jsonify({"message": "Status updated successfully."}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred.", "details": str(e)}), 500


@efficiency_bp.route("/efficiencySave", methods=["POST"])
def save_efficiency_summary():
    try:
        current_week = datetime.datetime.now(FINLAND_TZ).isocalendar()[1]
        current_year = datetime.datetime.now(FINLAND_TZ).year
        summary_name = f"KokkolaEfficiency_Week{current_week}"
        saved_summary_name = f"KokkolaEfficiency_{current_week}/{current_year}_saved"

        existing_summary = efficiency_collection.find_one(
            {"summary_name": summary_name}
        )
        if not existing_summary:
            return jsonify({"error": "Summary not found."}), 404

        # Check if saved summary already exist s
        existing_saved_summary = efficiency_collection.find_one(
            {"summary_name": saved_summary_name}
        )

        saved_summary = existing_summary.copy()
        saved_summary.pop("_id", None)  # Generate a new ObjectId
        saved_summary["summary_name"] = saved_summary_name
        saved_summary["saved_at"] = datetime.datetime.now(FINLAND_TZ)

        if existing_saved_summary:
            efficiency_collection.update_one(
                {"summary_name": saved_summary_name}, {"$set": saved_summary}
            )
            return jsonify({"message": "Summary updated successfully."}), 200
        else:
            efficiency_collection.insert_one(saved_summary)
            return jsonify({"message": "Summary saved successfully."}), 200

    except Exception as e:
        print(f"Error in save_efficiency_summary: {str(e)}")
        return jsonify({"error": str(e)}), 500


@efficiency_bp.route("/efficiencyHistory", methods=["POST"])
def efficiency_history():
    try:
        data = request.get_json()
        weeks = data.get("weeks", [])
        years = data.get("years", [])
        print(f"Received data: weeks={weeks}, years={years}")

        if not weeks or not years:
            return jsonify({"error": "weeks and years are required."}), 400

        response_data = []

        for year in years:
            for week in weeks:
                # Build the query dynamically for each week and year
                query = {
                    "summary_name": f"KokkolaEfficiency_{week}/{year}_saved",
                }
                print(f"Query filter for week {week}, year {year}: {query}")

                # Fetch documents
                documents = list(efficiency_collection.find(query))
                print(
                    f"Documents fetched for week {week}, year {year}: {len(documents)}"
                )

                for doc in documents:
                    doc["_id"] = str(doc["_id"])
                    response_data.append(doc)
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
