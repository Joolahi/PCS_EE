from .task_routes import task_bp
from .section_routes import section_bp
from .get_workdata import workdata_bp
from .efficiency_routes import efficiency_bp
from .user_routes import user_bp
from .planning_routes import planning_bp

# Export all blueprints for easy import in App initialization
__all__ = [
    "task_bp",
    "section_bp",
    "workdata_bp",
    "efficiency_bp",
    "user_bp",
    "planning_bp",
]
all_blueprints = [
    task_bp,
    section_bp,
    workdata_bp,
    efficiency_bp,
    user_bp,
    planning_bp,
]
