from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from flask import Flask, jsonify, send_from_directory

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND / "static"))

BASE_ASSETS = [
    {"id": "WAP-7 30765", "type": "Electric locomotive", "line": "Delhi–Mumbai", "status": "Ready", "due": "18 Aug", "health": 92, "tone": "blue"},
    {"id": "LHB Rake 82401", "type": "Passenger rake", "line": "Mumbai Central", "status": "Service due", "due": "Today", "health": 76, "tone": "amber"},
    {"id": "WDP-4D 40518", "type": "Diesel locomotive", "line": "Pune Division", "status": "Ready", "due": "21 Aug", "health": 88, "tone": "blue"},
]

state = {"assets": deepcopy(BASE_ASSETS), "replanned": False}

def metrics():
    failed = sum(asset["status"] == "Failure reported" for asset in state["assets"])
    availability = 96.1 if state["replanned"] else (89.8 if failed else 94.6)
    return {
        "availability": availability,
        "failed_assets": failed,
        "protected_trains": 148,
        "blocks_due": 3 if failed else 2,
    }

def build_plan():
    current = metrics()
    first = "02:30–04:15" if state["replanned"] else "01:30–04:00"
    return {
        "status": "replanned" if state["replanned"] else "optimized",
        "metrics": current,
        "message": "Reserve capacity retained across the corridor." if state["replanned"] else "Lowest-impact windows selected using demand and reserve capacity.",
        "blocks": [
            {"asset": "WAP-7 30765", "work": "Traction inspection", "time": first, "left": 9, "width": 18, "tone": "blue"},
            {"asset": "LHB Rake 82401", "work": "Brake integrity check", "time": "06:30–08:30", "left": 34, "width": 16, "tone": "mint"},
            {"asset": "WDP-4D 40518", "work": "Engine diagnostics", "time": "14:30–16:15", "left": 66, "width": 13, "tone": "purple"},
        ],
    }

@app.get("/")
def index():
    return send_from_directory(FRONTEND, "index.html")

@app.get("/api/dashboard")
def dashboard():
    return jsonify({"metrics": metrics(), "assets": state["assets"], "plan": build_plan()})

@app.get("/api/assets")
def assets():
    return jsonify(state["assets"])

@app.post("/api/assets/<asset_id>/simulate-failure")
def simulate_failure(asset_id: str):
    for asset in state["assets"]:
        if asset["id"] == asset_id:
            asset.update({"status": "Failure reported", "health": 41, "tone": "red"})
            state["replanned"] = False
            return jsonify({
                "message": f"{asset_id} moved to incident review.",
                "metrics": metrics()
            })
    return jsonify({"error": "Asset not found"}), 404

@app.post("/api/plan/replan")
def replan():
    state["replanned"] = True
    for asset in state["assets"]:
        if asset["status"] == "Failure reported":
            asset.update({"status": "Reserve cover assigned", "health": 41, "tone": "amber"})
    plan_data = build_plan()
    return jsonify({
        **plan_data,
        "message": "Maintenance schedule optimized and reserve units assigned."
    })

@app.post("/api/reset")
def reset():
    state["assets"] = deepcopy(BASE_ASSETS)
    state["replanned"] = False
    return jsonify({"message": "Demo data reset successfully.", "metrics": metrics()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
