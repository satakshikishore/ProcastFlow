from flask import Blueprint, jsonify
from models import Task, Step, User

report_bp = Blueprint("report", __name__)


@report_bp.route("/report/<int:user_id>", methods=["GET"])
def get_report(user_id):
    if not User.query.get(user_id):
        return jsonify({"error": "User not found"}), 404

    tasks = Task.query.filter_by(user_id=user_id).all()

    total_tasks = len(tasks)
    total_steps = 0
    completed_steps = 0
    task_summaries = []

    for task in tasks:
        steps = task.steps
        t_total = len(steps)
        t_done = sum(1 for s in steps if s.is_completed)
        total_steps += t_total
        completed_steps += t_done

        task_summaries.append({
            "task_id": task.id,
            "title": task.title,
            "created_at": task.created_at.isoformat(),
            "total_steps": t_total,
            "completed_steps": t_done,
            "completion_pct": round((t_done / t_total * 100) if t_total else 0, 1),
        })

    overall_pct = round((completed_steps / total_steps * 100) if total_steps else 0, 1)

    return jsonify({
        "user_id": user_id,
        "total_tasks": total_tasks,
        "total_steps": total_steps,
        "completed_steps": completed_steps,
        "overall_completion_pct": overall_pct,
        "tasks": task_summaries,
    }), 200