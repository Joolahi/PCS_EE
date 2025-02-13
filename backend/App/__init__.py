import os
from flask import Flask
from dotenv import load_dotenv
from App.config import config_by_name
from App.extensions import db, init_cors
from App.routes import all_blueprints
from flask_jwt_extended import JWTManager
from flask_cors import CORS

load_dotenv()
jwt = JWTManager()


def create_app(config_name="development"):
    app = Flask(__name__)
    # Load configuration-
    app.config.from_object(config_by_name[config_name])
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT")

    # Initialize extensions
    init_cors(app)
    app.db = db  # Add the MongoDB client to the app for easy access
    jwt.init_app(app)
    for bp in all_blueprints:
        app.register_blueprint(bp, url_prefix="/api")
    return app
