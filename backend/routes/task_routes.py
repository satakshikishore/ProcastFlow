from flask import Blueprint, request, jsonify
from models import db, Task, Step, User

task_bp = Blueprint("tasks", __name__)


# ── Create task (with optional pre-built steps) ──────────────────────────────
@task_bp.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    user_id = data.get("user_id")
    title = (data.get("title") or "").strip()
    steps_data = data.get("steps", [])  # list of step strings

    if not user_id or not title:
        return jsonify({"error": "user_id and title are required"}), 400

    if not User.query.get(user_id):
        return jsonify({"error": "User not found"}), 404

    task = Task(user_id=user_id, title=title)
    db.session.add(task)
    db.session.flush()  # get task.id before committing

    for i, step_text in enumerate(steps_data):
        if isinstance(step_text, str) and step_text.strip():
            step = Step(task_id=task.id, step_text=step_text.strip(), order=i)
            db.session.add(step)

    db.session.commit()
    return jsonify(task.to_dict()), 201


# ── Get all tasks for a user ──────────────────────────────────────────────────
@task_bp.route("/tasks/<int:user_id>", methods=["GET"])
def get_tasks(user_id):
    if not User.query.get(user_id):
        return jsonify({"error": "User not found"}), 404

    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


# ── Toggle step completion ────────────────────────────────────────────────────
@task_bp.route("/tasks/<int:task_id>/steps/<int:step_id>", methods=["PUT"])
def update_step(task_id, step_id):
    step = Step.query.filter_by(id=step_id, task_id=task_id).first()
    if not step:
        return jsonify({"error": "Step not found"}), 404

    data = request.get_json()
    if "is_completed" in data:
        step.is_completed = bool(data["is_completed"])
    if "step_text" in data:
        step.step_text = data["step_text"].strip()

    db.session.commit()
    return jsonify(step.to_dict()), 200


# ── Delete task ───────────────────────────────────────────────────────────────
@task_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200