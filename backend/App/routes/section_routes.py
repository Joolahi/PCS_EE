from bson import ObjectId
from flask import Blueprint, request, jsonify
from App.extensions.db import get_collection

section_bp = Blueprint("sections", __name__)


@section_bp.route("/update_osasto", methods=["POST"])
def update_osasto():
    """
    Update Osasto, Jononumero, and Quantity fields for a specific row using ObjectId.
    """
    try:
        data = request.get_json()
        document_id = data.get("id")  # Get the document ObjectId as a string
        new_osasto_value = data.get("new_osasto_value")
        new_jononumero_value = data.get("new_jononumero_value")
        new_quantity_value = data.get("new_quantity_value")

        if not document_id:
            return jsonify({"error": "Missing document ID"}), 400

        collection = get_collection("Kokkola")

        # Convert document_id to ObjectId
        try:
            object_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid document ID"}), 400

        try:
            new_osasto_value = int(new_osasto_value)
            new_quantity_value = int(new_quantity_value)
            new_jononumero_value = int(new_jononumero_value)
        except ValueError:
            return jsonify({"error": "Invalid input data"}), 400

        # Update the document
        result = collection.update_one(
            {"_id": object_id},
            {
                "$set": {
                    "Osasto": new_osasto_value,
                    "Jononumero": new_jononumero_value,
                    "Quantity": new_quantity_value,
                }
            },
        )

        if result.matched_count == 0:
            return jsonify({"error": "Document not found"}), 404

        return jsonify({"message": "Document updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@section_bp.route("/add_row", methods=["POST"])
def add_row():
    """
    Duplicate an existing row and add it as a new document.
    """
    try:
        data = request.get_json()
        if not data or "id" not in data:
            return jsonify({"error": "No data provided or missing document ID"}), 400

        collection = get_collection("Kokkola")

        # Convert id to ObjectId
        try:
            object_id = ObjectId(data["id"])
        except Exception:
            return jsonify({"error": "Invalid document ID"}), 400

        # Fetch the existing document
        existing_doc = collection.find_one({"_id": object_id})
        if not existing_doc:
            return jsonify({"error": "Document not found"}), 404

        # Remove '_id' to avoid duplicate key errors and create a new document
        existing_doc.pop("_id", None)
        result = collection.insert_one(existing_doc)

        return (
            jsonify(
                {
                    "message": "Row duplicated successfully",
                    "new_id": str(result.inserted_id),
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@section_bp.route("/delete_row", methods=["POST"])
def delete_row():
    """
    Delete a document by its ObjectId.
    """
    try:
        data = request.get_json()
        document_id = data.get("id")  # Expecting an ObjectId as a string

        if not document_id:
            return jsonify({"error": "Missing document ID"}), 400

        collection = get_collection("Kokkola")

        # Convert id to ObjectId
        try:
            object_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid document ID"}), 400

        result = collection.delete_one({"_id": object_id})

        if result.deleted_count == 0:
            return jsonify({"error": "Document not found"}), 404

        return jsonify({"message": "Row deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@section_bp.route("/empty_data", methods=["POST"])
def empty_row():
    try:
        data = request.get_json()
        document_id = data.get("id")

        if not document_id:
            return jsonify({"error": "Documnent ID is required"}), 400

        collection = get_collection("Kokkola")
        try:
            object_id = ObjectId(document_id)
        except Exception:
            return jsonify({"error": "Invalid document ID"}), 400

        document = collection.find_one({"_id": object_id})
        if not document:
            return jsonify({"error": "Document not found"}), 404

        update_doc = {
            "$unset": {
                field: ""
                for field in document.keys()
                if field.startswith("Status") or field.startswith("total_made")
            },
            "$set": {"Task": []},
        }

        result = collection.update_one({"_id": object_id}, update_doc)

        if result.modified_count == 0:
            return jsonify({"error": "Document not updated"}), 500

        return jsonify({"message": "Document updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
