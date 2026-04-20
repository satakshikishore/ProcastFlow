from flask import Blueprint, request, jsonify
from services.ai_service import break_task
from models import db, Task, Step, User

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/ai/task-break", methods=["POST"])
def task_break():
    data = request.get_json()
    task_title = (data.get("task") or "").strip()
    user_id = data.get("user_id")  # optional — if provided, auto-save to DB

    if not task_title:
        return jsonify({"error": "task field is required"}), 400

    # Call AI service
    result = break_task(task_title)

    # If user_id is provided, save task + steps to DB automatically
    if user_id:
        user = User.query.get(user_id)
        if user:
            task = Task(user_id=user_id, title=result["title"])
            db.session.add(task)
            db.session.flush()

            for i, step_text in enumerate(result["steps"]):
                step = Step(task_id=task.id, step_text=step_text, order=i)
                db.session.add(step)

            db.session.commit()
            result["task_id"] = task.id  # return id so frontend can use it

    return jsonify(result), 200