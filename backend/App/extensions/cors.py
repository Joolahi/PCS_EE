from flask_cors import CORS


def init_cors(app):
    """Initialize CORS with default settings."""
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["*"],
                "methods": ["GET", "POST"],
                "supports_credentials": True,
            }
        },
    )
