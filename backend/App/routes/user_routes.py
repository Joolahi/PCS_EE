from flask import Blueprint, make_response, request, jsonify, session
from flask_jwt_extended import create_access_token
from App.extensions.db import get_collection, get_collection_efficiency
from bson.objectid import ObjectId
import os
import json
import bcrypt

user_bp = Blueprint("user", __name__)
USERFILE = "user.json"


def get_users():
    if not os.path.exists(USERFILE):
        with open(USERFILE, "w") as file:
            json.dump({"user": []}, file)
    with open(USERFILE, "r") as file:
        user = json.load(file)
    return user["user"]


def save_users(users):
    with open(USERFILE, "w") as file:
        json.dump({"user": users}, file)


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    users = get_users()
    user = next((user for user in users if user["username"] == username), None)

    if user and bcrypt.checkpw(
        password.encode("utf-8"), user["password"].encode("utf-8")
    ):
        access_token = create_access_token(identity=username)
        return (jsonify({"access_token": access_token}), 200)
    else:
        return (jsonify({"error": "Invalid username or password"}), 401)


@user_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("username", None)
    response = make_response(jsonify({"message": "Successfully logged out"}), 200)
    response.set_cookie("session", "", expires=0, httponly=True, secure=True)
    return response


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = get_users()
    if any(user["username"] == username for user in users):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )
    users.append({"username": username, "password": hashed_password})
    save_users(users)

    return jsonify({"message": "User created successfully"}), 201
