from .db import db
from .cors import init_cors

# Export extensions for easy import
__all__ = ["db", "init_cors"]
