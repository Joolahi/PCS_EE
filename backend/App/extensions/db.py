from pymongo import MongoClient
import os

# Load MongoDB configuration from environment variables
mongo_uri = os.getenv("MONGO_URI")
database_name = os.getenv("DATABASE_NAME")
default_collection_name = os.getenv("COLLECTION_NAME")

if not mongo_uri:
    raise ValueError("MONGO_URI is not set in the environment variables.")
if not database_name:
    raise ValueError("DATABASE_NAME is not set in the environment variables.")

client = MongoClient(mongo_uri)
db = client[database_name]

# Default collection (can be replaced or accessed dynamically)
default_collection = db[default_collection_name]


# Function to get any collection dynamically
def get_collection(name=None):
    """Fetch a MongoDB collection by name."""
    return db[name or default_collection_name]


def get_collection_koodit(name=None):
    """Fetch a MongoDB collection by name."""
    return db[name or "Koodit"]


def get_collection_forms(name=None):
    """Fetch a MongoDB collection by name."""
    return db[name or "Forms"]


def get_collection_efficiency(name=None):
    """Fetch a MongoDB collection by name."""
    return db[name or "KokkolaEfficiency"]


def get_collection_planning(name=None):
    """Fetch a MongoDB collection by name."""
    return db[name or "KokkolaPlanning"]
