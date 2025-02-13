from bson import ObjectId
from flask import Blueprint, jsonify, request
from App.extensions.db import get_collection

# Create blueprint
workdata_bp = Blueprint("workdata", __name__)


@workdata_bp.route("/fetch_user_works", methods=["POST"])
def fetch_user_tasks():
    try:
        collection = get_collection("Kokkola")
        data = request.get_json()
        worker_name = data.get("workerName")

        if not worker_name:
            return jsonify({"error": "Worker name is required"}), 400

        documents = collection.find(
            {"Task.workerName": worker_name},
            {
                "Task": 1,
                "Jononumero": 1,
                "Item number": 1,
                "Reference number": 1,
                "Quantity": 1,
                "_id": 1,
                "StatusLeikkaus": 1,
                "StatusEsivalmistelu": 1,
                "StatusHygienia": 1,
                "StatusErikoispuoli": 1,
                "StatusRemmit": 1,
                "StatusPakkaus": 1,
                "Osasto": 1,
                "StatusPainatus": 1,
                "Sales order": 1,
            },
        )

        results = []
        for doc in documents:
            main_info = {
                "id": str(doc["_id"]),
                "Jononumero": doc.get("Jononumero"),
                "Item number": doc.get("Item number"),
                "Reference number": doc.get("Reference number"),
                "Quantity": doc.get("Quantity"),
                "StatusLeikkaus": doc.get("StatusLeikkaus"),
                "StatusEsivalmistelu": doc.get("StatusEsivalmistelu"),
                "StatusHygienia": doc.get("StatusHygienia"),
                "StatusRemmit": doc.get("StatusRemmit"),
                "StatusPakkaus": doc.get("StatusPakkaus"),
                "StatusErikoispuoli": doc.get("StatusErikoispuoli"),
                "StatusPainatus": doc.get("StatusPainatus"),
                "Osasto": doc.get("Osasto"),
                "Sales order": doc.get("Sales order"),
            }
            user_tasks = [
                task
                for task in doc.get("Task", [])
                if task.get("workerName") == worker_name
            ]
            for task in user_tasks:
                results.append({**main_info, **task})

        if not results:
            return jsonify({"message": "No tasks found for this user"}), 404

        return jsonify({"tasks": results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workdata_bp.route("/fetch_history", methods=["POST"])
def fetch_history():
    try:
        collection = get_collection("Kokkola")
        data = request.get_json()
        document_id = data.get("id")
        section = data.get("section")

        if not document_id:
            return jsonify({"error": "Document ID is reuqired"}), 400

        try:
            document_id = ObjectId(document_id)
        except:
            return jsonify({"error": "Invalid document ID"}), 400

        document = collection.find_one({"_id": document_id})
        if not document:
            return jsonify({"error": "Document not found"}), 404

        tasks = document.get("Task", [])
        filtered_tasks = [task for task in tasks if task.get("section") == section]
        if not filtered_tasks:
            return jsonify({"message": "No tasks found for this section"}), 404

        return jsonify({"tasks": filtered_tasks}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workdata_bp.route("/modify_task", methods=["POST"])
def modify_task():
    try:
        collection = get_collection("Kokkola")
        data = request.get_json()

        document_id = data.get("id")
        task_id = data.get("task_id")
        new_quantity = data.get("new_quantity")
        new_phase = data.get("new_phase")

        if not document_id or not task_id:
            return (
                jsonify(
                    {"error": "Missing required fields: 'id', 'section', or 'task_id'"}
                ),
                400,
            )
        try:
            document_id = ObjectId(document_id)
        except:
            return jsonify({"error": "Invalid document ID"}), 400

        document = collection.find_one({"_id": document_id})
        if not document:
            return jsonify({"error": "Document not found"}), 404

        tasks = document.get("Task", [])
        task_found = False

        for task in tasks:
            if task.get("task_id") == task_id:
                task["kpl_done"] = new_quantity
                task["phase"] = new_phase
                task_found = True
                break

        if not task_found:
            return jsonify({"error": "Task not found"}), 404

        # Update MongoDB with the modified task list
        collection.update_one({"_id": document_id}, {"$set": {"Task": tasks}})

        return jsonify({"message": "Task updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@workdata_bp.route("/update_total_made_section", methods=["POST"])
def update_total_made_section():
    try:
        collection = get_collection("Kokkola")
        data = request.get_json()

        # Extract fields from request payload
        document_id = data.get("id")
        section = data.get("section")
        total_made = data.get("total_made")

        if not document_id or not section or total_made is None:
            return (
                jsonify(
                    {
                        "error": "Missing required fields: 'id', 'section', or 'total_made'"
                    }
                ),
                400,
            )

        # Validate ObjectId
        try:
            document_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid document ID"}), 400

        # Fetch the document from database
        document = collection.find_one({"_id": document_id})
        if not document:
            return jsonify({"error": "Document not found"}), 404

        # Step 1: Update total_made{section}
        total_made_field = f"total_made{section}"
        status_field = f"Status{section}"

        # Step 2: Compare total_made with Quantity
        quantity = document.get("Quantity", 0)
        if total_made == quantity:
            new_status = "Valmis"
        elif total_made > quantity:
            new_status = "Yli"
        else:
            new_status = "Aloitettu"

        # Step 3: Update the document fields
        update_fields = {
            total_made_field: total_made,
            status_field: new_status,
        }

        result = collection.update_one({"_id": document_id}, {"$set": update_fields})

        if result.matched_count == 0:
            return jsonify({"error": "Failed to update document"}), 500

        return (
            jsonify(
                {
                    "message": f"Total made and status for section '{section}' updated successfully",
                    total_made_field: total_made,
                    status_field: new_status,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def convert_to_minutes(total_time):
    """Convert 'hh:mm' format to minutes."""
    if not total_time:
        return 0
    hours, minutes = map(int, total_time.split(":"))
    return hours * 60 + minutes


def convert_to_hours_minutes(total_minutes):
    """Convert total minutes to 'hh:mm' format."""
    hours = total_minutes // 60
    minutes = total_minutes % 60
    return f"{hours:02}:{minutes:02}"


@workdata_bp.route("/work_hours", methods=["POST"])
def get_total_work_hours_by_section():
    data = request.get_json()
    section_filter = data.get("section")
    collection = get_collection("")
    try:
        # Fetch all documents from the collection
        documents = collection.find(
            {},
            {
                "Task": 1,
                "Item number": 1,
                "Reference number": 1,
                "Sales order": 1,
                "total_made": 1,
                "Osasto": 1,
            },
        )
        item_totals = {}
        # Process each document
        for doc in documents:
            object_id = str(doc["_id"])
            item_number = doc.get("Item number")
            reference_number = doc.get("Reference number")
            sales_order = doc.get("Sales order")
            osasto = doc.get("Osasto")
            tasks = doc.get("Task", [])
            total_made = doc.get("total_made", 0)

            section_totals = {}
            for task in tasks:
                section = task.get("section")
                total_time = task.get("total_time", "00:00")

                if section and total_time:
                    section_totals[section] = section_totals.get(
                        section, 0
                    ) + convert_to_minutes(total_time)

            for sec, total_minutes in section_totals.items():
                if section_filter and sec != section_filter:
                    continue
                unique_key = f"{object_id}_{item_number}"
                item_totals[unique_key] = {
                    "Item number": item_number,
                    "Reference number": reference_number,
                    "Osasto": osasto,
                    "Sales order": sales_order,
                    "section": sec,
                    "total_work_hours": convert_to_hours_minutes(total_minutes),
                    "object_id": object_id,
                    "Task": tasks,
                    "total_made": total_made,
                }
        results = list(item_totals.values())
        if not results:
            return jsonify({"message": "No data found"}), 404

        return jsonify({"data": results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
