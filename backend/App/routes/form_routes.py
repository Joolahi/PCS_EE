from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import pytz
from App.extensions.db import get_collection_forms

forms_bp = Blueprint("forms", __name__)
FINLAND_TZ = pytz.timezone("Europe/Helsinki")


@forms_bp.route("/save-initative", methods=["POST"])
def save_initiative():
    try:
        collection = get_collection_forms()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        form_data = {
            "formType": data.get("formType", ""),
            "laatimispvm": data.get("laatimispvm"),  # Already in dd.mm.yyyy format
            "laatijat": [
                name.strip() for name in data.get("laatijat", []) if name.strip()
            ],
            "otsikko": data.get("otsikko", ""),
            "nykytilanne": data.get("nykytilanne", ""),
            "parannusehdotus": data.get("parannusehdotus", ""),
            "liitteet": data.get("liitteet", ""),
            "hyvaksytty": data.get("hyvaksytty", False),
            "kasiteltyPvm": data.get("kasiteltyPvm"),  # Date in dd.mm.yyyy format
            "paatos": data.get("paatos", ""),
            "palkkioMaksettu": data.get("palkkioMaksettu"),  # Date
            "toimenpiteet": data.get("toimenpiteet", ""),
            "kaikkiToimenpiteetTehty": data.get("kaikkiToimenpiteetTehty"),  # Date
            "created_at": datetime.now(FINLAND_TZ),  # Record creation timestamp
        }

        result = collection.insert_one(form_data)

        return (
            jsonify(
                {
                    "message": "Form data saved successfully",
                    "id": str(result.inserted_id),  # Return the new document ID
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forms_bp.route("/save-deviation", methods=["POST"])
def save_deviation():
    try:
        collection = get_collection_forms()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        form_data = {
            "formType": data.get("formType", ""),
            "PoNumber": data.get("PoNumero", ""),
            "WoNumber": data.get("WoNumero", ""),
            "productcode": data.get("tuotekoodi", ""),
            "detectedDeviation": data.get("havaittuPoikkeama", ""),
            "description": data.get("lisatiedot", ""),
            "date": data.get("date", None),
            "nimi": data.get("nimi", ""),
            "selectedOption": data.get("selectedOption", None),
            "infoToSupervisor": data.get("decision", ""),
            "created_at": datetime.now(FINLAND_TZ),  # Record creation timestamp
        }

        result = collection.insert_one(form_data)

        return jsonify(
            {
                "message": "Form data saved successfully",
                "id": str(result.inserted_id),  # Return the new document ID
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forms_bp.route("/save-safetyObservation", methods=["POST"])
def save_safetyObservation():
    try:
        collection = get_collection_forms()
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        form_data = {
            "formType": data.get("formType", ""),
            "date": data.get("date"),  # Already formatted as dd.mm.yyyy
            "safetyIssue": data.get("safetyIssue", False),
            "nearMiss": data.get("nearMiss", False),
            "causes": data.get("causes", {}),
            "improvementSuggestions": data.get("improvementSuggestions", {}),
            "urgency": data.get("urgency", ""),
            "whatHappened": data.get("whatHappened", ""),
            "where": data.get("where", ""),
            "howAndWhy": data.get("howAndWhy", ""),
            "whoInvolved": data.get("whoInvolved", ""),
            "consequences": data.get("consequences", ""),
            "isResolved": data.get("isResolved", False),
            "actionProposal": data.get("actionProposal", ""),
            "yourName": data.get("yourName", ""),
            "employerName": data.get("employerName", ""),
            "created_at": datetime.utcnow(),  # Timestamp when the record is created
        }

        result = collection.insert_one(form_data)

        return (
            jsonify(
                {
                    "message": "Form data saved successfully",
                    "id": str(result.inserted_id),  # Return the new document ID
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forms_bp.route("/getAllForms", methods=["GET"])
def get_all_forms():
    """
    Fetch all submitted forms from the collection.
    """
    try:
        collection = get_collection_forms()
        forms = list(collection.find({}))  # Fetch all documents
        for form in forms:
            form["_id"] = str(form["_id"])  # Convert ObjectId to string

        return jsonify(forms), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forms_bp.route("/forms/<string:formType>/<string:form_id>", methods=["GET"])
def get_form_details(formType, form_id):
    """
    Fetch a single form's details by its ID and type.
    """
    try:
        collection = get_collection_forms()

        # Find the document with the matching formType and ObjectId
        form = collection.find_one({"_id": ObjectId(form_id), "formType": formType})
        if not form:
            return jsonify({"error": "Form not found"}), 404

        # Convert ObjectId to string
        form["_id"] = str(form["_id"])

        return jsonify(form), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forms_bp.route("/forms/update/<string:formType>/<string:form_id>", methods=["PUT"])
def update_specific_fields(formType, form_id):
    """
    Update specific fields for a form in the database.
    """
    try:
        collection = get_collection_forms()
        data = request.get_json()

        # Validate input
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Define which fields can be updated
        allowed_fields = [
            "hyvaksytty",
            "kasiteltyPvm",
            "paatos",
            "palkkioMaksettu",
            "toimenpiteet",
            "kaikkiToimenpiteetTehty",
        ]

        # Filter only allowed fields
        update_data = {
            key: value for key, value in data.items() if key in allowed_fields
        }

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        # Update the document in the database
        result = collection.update_one(
            {"_id": ObjectId(form_id), "formType": formType}, {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Form not found"}), 404
 
        return jsonify({"message": "Form updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
