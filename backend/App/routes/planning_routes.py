from bson import ObjectId
from flask import Blueprint, jsonify, request
from App.extensions.db import get_collection_planning, get_collection
import math
from datetime import datetime

# Create blueprint
planning_bp = Blueprint("planning", __name__)


@planning_bp.route("/planning", methods=["POST"])
def get_planning():
    """Get planning data by week."""
    try:
        # Access the collection
        collection = get_collection_planning()
        data = request.get_json() or {}

        # Determine the week-year to fetch
        current_date = datetime.utcnow()
        current_week = f"{current_date.year}-W{current_date.isocalendar()[1]:02d}"
        week_year = data.get(
            "year", current_week
        )  # Default to current week if not provided

        print(f"Fetching data for: {week_year}")

        # Fetch the document for the specified week
        result = collection.find_one({"VKO-year": week_year})

        if not result:
            return jsonify({"message": f"No data found for {week_year}"}), 404

        # Ensure _id is serializable
        result["_id"] = str(result["_id"])

        # Process WeeklyData if present and valid
        if "WeeklyData" in result and isinstance(result["WeeklyData"], list):
            result["WeeklyData"] = [
                {
                    **{
                        key: (str(value) if key == "_id" else value)
                        for key, value in item.items()
                    },
                    **{
                        key: None
                        for key, value in item.items()
                        if isinstance(value, float) and math.isnan(value)
                    },
                }
                for item in result["WeeklyData"]
            ]

        # Include ompelijat if it exists in the document
        ompelijat = result.get("ompelijat", None)
        viikon_paivat = result.get("tyopaiviaViikko", None)
        # Return the result
        return (
            jsonify(
                {
                    "WeeklyData": result.get("WeeklyData", []),
                    "ompelijat": ompelijat,
                    "tyopaiviaViikko": viikon_paivat,
                }
            ),
            200,
        )

    except Exception as e:
        # Catch and log errors
        print(f"Error fetching planning data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@planning_bp.route("/add-weeklydata", methods=["POST"])
def add_weekly_data():
    try:
        data = request.get_json()
        vko_year = data.get("VKO-year")
        object_ids = data.get("object_ids")  # Match the key in the request

        print(data)  # Debugging

        if not vko_year:
            return jsonify({"error": "VKO-year is required"}), 400
        if not object_ids or not isinstance(object_ids, list):
            return jsonify({"error": "ObjectIDs is required and must be a list"}), 400

        collection_planning = get_collection_planning()
        collection = get_collection()

        # Convert string ObjectIDs to ObjectId instances
        object_ids = [ObjectId(obj_id) for obj_id in object_ids]

        # Fetch items from the `Kokkola` collection
        kokkola_items = list(collection.find({"_id": {"$in": object_ids}}))
        print("Fetched items:", kokkola_items)  # Debugging

        if not kokkola_items:
            return jsonify({"error": "No items found with the provided ObjectIDs"}), 404

        # Check if the document for the specified VKO-year exists in PlanningKokkola
        planning_doc = collection_planning.find_one({"VKO-year": vko_year})

        if not planning_doc:
            # If the document doesn't exist, create it with the new VKO-year and add WeeklyData
            collection_planning.insert_one(
                {"VKO-year": vko_year, "WeeklyData": kokkola_items}
            )
        else:
            # If the document exists, append the fetched items to the `WeeklyData` array
            collection_planning.update_one(
                {"VKO-year": vko_year},
                {"$push": {"WeeklyData": {"$each": kokkola_items}}},
            )

        return jsonify({"message": "Data added successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@planning_bp.route("/planning/updateOmpelu", methods=["POST"])
def update_ompelu():
    """Update ompelu data for a specific week."""
    try:
        data = request.get_json()
        week_year = data.get("VKO_year")
        ompelijat = int(data.get("ompelijat"))
        tyopaivia_viikko = int(data.get("tyopaiviaViikko"))
        total_ompelu = data.get("totalOmpeluTunnit")

        if not week_year:
            return jsonify({"error": "VKO_year is required"}), 400

        collection = get_collection_planning()

        update_data = {}
        if ompelijat is not None:
            update_data["ompelijat"] = ompelijat
        if tyopaivia_viikko is not None:
            update_data["tyopaiviaViikko"] = tyopaivia_viikko
        if total_ompelu is not None:
            update_data["totalOmpeluTunnit"] = total_ompelu

        collection.update_one({"VKO-year": week_year}, {"$set": update_data})

        return jsonify({"message": "Data updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
