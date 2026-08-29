# NETRA BLOCK — Flask Edition

A full Python/Flask railway maintenance-block planning prototype with a responsive operations dashboard. It uses simulated data only; do not use it for live railway or safety-critical control.

## Stack

- Python + Flask REST API
- HTML, CSS and vanilla JavaScript frontend
- In-memory demo data for assets, failure simulation and AI-replanning flow

## Run on Windows

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python backend\app.py
```

Open `http://127.0.0.1:5000`.

If PowerShell blocks activation, use Command Prompt instead:

```cmd
.venv\Scripts\activate.bat
```

## Demo flow

1. Open the Block planner.
2. Simulate failure for WAP-7 30765.
3. Click **Replan now**.
4. Review the updated availability and fleet status.

## API

- `GET /api/dashboard`
- `GET /api/assets`
- `POST /api/assets/<asset_id>/simulate-failure`
- `POST /api/plan/replan`
- `POST /api/reset`
