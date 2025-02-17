from flask import Blueprint, jsonify, request
from datetime import datetime
import pytz
from bson import ObjectId
from App.extensions import db
from App.extensions.db import get_collection, get_collection_koodit
import os
import pandas as pd
import math
import uuid

FINLAND_TZ = pytz.timezone("Europe/Helsinki")

# Create blueprint
task_bp = Blueprint("tasks", __name__)
# File upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@task_bp.route("/getData", methods=["GET"])
def get_data():
    try:
        # Use default collection or fetch another dynamically
        collection = get_collection()  # Default collection is used from .env
        result = list(collection.find())

        # Convert ObjectId to string and replace NaN with empty strings
        for doc in result:
            doc["_id"] = str(doc["_id"])
            for key, value in doc.items():
                if isinstance(value, float) and math.isnan(value):  # Check if NaN
                    doc[key] = ""
                elif value is None:
                    doc[key] = ""

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/start_task", methods=["POST"])
def start_task():
    try:
        collection = get_collection()
        data = request.get_json()

        document_id = data.get("id")
        worker_names = data.get("workerNames", [])
        phase = data.get("phase")
        section = data.get("section")

        if not document_id or not worker_names or not phase or not section:
            return jsonify({"error": "Missing required fields"}), 400

        try:
            document_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid ID"}), 400

        group_id = str(uuid.uuid4())
        current_time = datetime.now(FINLAND_TZ)
        status_field = f"Status{section}"
        new_tasks = [
            {
                "task_id": str(uuid.uuid4()),
                "start": current_time.isoformat(),
                "workerName": worker,
                "phase": phase,
                "section": section,
                "group_id": group_id,
            }
            for worker in worker_names
        ]
        result = collection.update_one(
            {"_id": document_id},
            {
                "$set": {status_field: "Aloitettu"},
                "$push": {"Task": {"$each": new_tasks}},
            },
        )
        if result.matched_count == 0:
            return jsonify({"error": "Document not found"}), 404

        return jsonify({"message": "Task started successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/endTask", methods=["POST"])
def end_task():
    try:
        collection = get_collection()
        data = request.get_json()

        document_id = data.get("id")
        group_id = data.get("group_id")
        kpl_done = data.get("kpl_done", 0)
        comment = data.get("comment", "")

        if not document_id or not group_id or kpl_done < 0:
            return jsonify({"error": "Missing required fields"}), 400

        try:
            document_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid ID"}), 400

        document = collection.find_one({"_id": document_id})
        if not document:
            return jsonify({"error": "Document not found"}), 404

        tasks = document.get("Task", [])
        task_found = False
        section = None

        # Step 1: Filter tasks with the same group_id and no end_time
        group_tasks = [
            task
            for task in tasks
            if task.get("group_id") == group_id and "end_time" not in task
        ]

        if not group_tasks:
            return (
                jsonify({"error": "No active tasks found for the provided group_id"}),
                404,
            )

        num_workers = len(group_tasks)
        if num_workers == 0:
            return jsonify({"error": "No workers found for the provided group_id"}), 404

        per_worker_kpl_done = round(kpl_done / num_workers, 2)
        distributed_kpl_done = [per_worker_kpl_done] * num_workers

        # Adjust the last worker's value to handle rounding issues
        distributed_kpl_done[-1] += round(kpl_done - sum(distributed_kpl_done), 2)

        # Step 3: Update each task in the group
        end_time = datetime.now(FINLAND_TZ)

        # Modify tasks in place
        for idx, task in enumerate(tasks):
            if task.get("group_id") == group_id and "end_time" not in task:
                task_found = True
                section = task.get("section")
                start_time = task["start"]

                # Ensure start_time is timezone-aware
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time)
                elif not isinstance(start_time, datetime):
                    raise ValueError("Invalid start time format")

                # If start_time is naive, localize it to FINLAND_TZ
                if start_time.tzinfo is None:
                    start_time = FINLAND_TZ.localize(start_time)

                total_seconds = (end_time - start_time).total_seconds()
                hours, remainder = divmod(int(total_seconds), 3600)
                minutes = remainder // 60
                total_time_formatted = f"{hours:02}:{minutes:02}"

                # Assign pre-calculated kpl_done
                task_kpl_done = distributed_kpl_done.pop(0)
                task.update(
                    {
                        "end_time": end_time.isoformat(),
                        "total_time": total_time_formatted,
                        "kpl_done": task_kpl_done,
                        "comment": comment,
                    }
                )

        if not task_found:
            return jsonify({"error": "Task not found"}), 404

        # Step 4: Conditionally calculate total_made and status ONLY if section is "Hygienia" or "Pakkaus"
        update_fields = {"Task": tasks}  # Update all tasks, preserving unrelated ones
        if section in ["Hygienia", "Pakkaus"]:
            total_made_field = f"total_made{section}"
            status_field = f"Status{section}"
            total_made = sum(
                task.get("kpl_done", 0)
                for task in tasks
                if task.get("section") == section
            )

            # Compare total_made with Quantity
            quantity = document.get("Quantity", 0)
            if total_made == quantity:
                new_status = "Valmis"
            elif total_made > quantity:
                new_status = "Yli"
            else:
                new_status = "Aloitettu"

            # Update total_made and status dynamically
            update_fields.update(
                {
                    total_made_field: total_made,
                    status_field: new_status,
                }
            )

        # Step 5: Update the document in the database
        result = collection.update_one({"_id": document_id}, {"$set": update_fields})

        if result.matched_count == 0:
            return jsonify({"error": "Failed to update task"}), 500

        response = {"message": "Task ended successfully"}
        if section == "Hygienia":
            response[total_made_field] = total_made
            response[status_field] = new_status

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/import_excel", methods=["POST"])
def import_excel():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        df = pd.read_excel(file_path)
        if df.empty:
            return jsonify({"error": "Uploaded Excel file is empty"}), 400
        koodit_collection = get_collection_koodit()
        koodit_data = list(koodit_collection.find({}, {"_id": 0}))
        koodit_lookup = {
            item["Item number"]
            .strip()
            .upper(): {
                "Category": item.get("Category", "Unknown"),
                "Standardiaika": float(
                    str(item.get("Standardiaika", "0")).replace(",", ".")
                ),
                "Kategoria": item.get("Kategoria", "Unknown"),
            }
            for item in koodit_data
        }

        enriched_data = []
        for _, row in df.iterrows():
            item_number = str(row.get("Item number", "")).strip().upper()
            koodit_match = koodit_lookup.get(item_number, {})

            ship_date = row.get("Ship date")
            formatted_date = ""
            vko_value = None
            if pd.notnull(ship_date):
                try:
                    date_obj = pd.to_datetime(
                        ship_date, format="%d/%m/%Y", dayfirst=True
                    )
                    formatted_date = date_obj.strftime("%d.%m.%Y")
                    vko_value = date_obj.isocalendar()[1]
                except Exception as e:
                    print(f"Error parsing 'Ship date': {e}")
            document = {
                "Item number": item_number,
                "Category": koodit_match.get("Category", "Unknown"),
                "Standardiaika": koodit_match.get("Standardiaika", 0),
                "Kategoria": koodit_match.get("Kategoria", "Unknown"),
                "Ship date": formatted_date,
                "VKO": vko_value,
                "Osasto": 1,
                "Jononumero": 1,
                **row.to_dict(),
            }
            document = {
                key: value
                for key, value in document.items()
                if pd.notnull(value) and value != ""
            }

            enriched_data.append(document)

        suomi_collection = get_collection()
        if enriched_data:
            suomi_collection.insert_many(enriched_data)
            return (
                jsonify(
                    {
                        "message": "Data imported and enriched successfully",
                        "inserted_records": len(enriched_data),
                    }
                ),
                200,
            )
        else:
            return jsonify({"error": "No data was enriched or inserted"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/updatePress", methods=["POST"])
def update_press():
    try:
        collection = get_collection()
        data = request.get_json()

        document_id = data.get("id")
        total_made = data.get("total_made")

        if not document_id or total_made is None:
            return jsonify({"error": "Missing required fields"}), 400

        try:
            document_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid ID"}), 400

        result = collection.update_one(
            {"_id": document_id}, {"$set": {"total_made": total_made}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Document not found"}), 404

        return jsonify({"message": "Press updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/getOsasto100", methods=["GET"])
def get_osasto100():
    try:
        collection = get_collection()  # Access the "Suomi" collection

        # Query MongoDB for documents where Osasto == 100
        result = list(collection.find({"Osasto": 100}))

        # Convert MongoDB ObjectId to string for JSON serialization
        for doc in result:
            doc["_id"] = str(doc["_id"])

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/getOsasto200", methods=["GET"])
def get_osasto200():
    try:
        collection = get_collection()
        result = list(collection.find({"Osasto": 200}))

        for doc in result:
            doc["_id"] = str(doc["_id"])

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/getOsasto300", methods=["GET"])
def get_osasto300():
    try:
        collection = get_collection()
        result = list(collection.find({"Osasto": 300}))

        for doc in result:
            doc["_id"] = str(doc["_id"])

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/getOsasto400", methods=["GET"])
def get_osasto400():
    try:
        collection = get_collection()
        result = list(collection.find({"Osasto": 400}))

        for doc in result:
            doc["_id"] = str(doc["_id"])

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("/getOsasto500", methods=["GET"])
def get_osasto500():
    try:
        collection = get_collection()
        result = list(collection.find({"Osasto": 500}))

        for doc in result:
            doc["_id"] = str(doc["_id"])

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_bp.route("getOsasto600", methods=["GET"])
def get_osasto600():
    try:
        collection = get_collection()
        result = list(collection.find({"Osasto": 600}))

        for doc in result:
            doc["_id"] = str(doc["_id"])

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
