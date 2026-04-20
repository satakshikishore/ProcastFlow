# ProcastFlow (PCF) — Backend Setup Guide

## 📁 Project Structure

```
backend/
├── app.py                  ← Flask entry point
├── config.py               ← App configuration
├── models.py               ← SQLAlchemy models (User, Task, Step)
├── requirements.txt
├── .env.example            ← Copy to .env and fill in keys
├── routes/
│   ├── auth_routes.py      ← POST /api/register, POST /api/login
│   ├── task_routes.py      ← CRUD for tasks & steps
│   ├── report_routes.py    ← GET /api/report/<user_id>
│   └── ai_routes.py        ← POST /api/ai/task-break
├── services/
│   └── ai_service.py       ← AI integration (Anthropic or OpenAI)
└── frontend_updated/       ← Drop-in replacements for your JS files
    ├── api.js              ← NEW: centralized API helper (include first!)
    ├── auth.js
    ├── taskbreaker.js
    ├── todo.js
    └── report.js
```

---

## ⚡ Quick Start

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and add your API key
```

### 3. Run the server

```bash
python app.py
```

Server runs at: `http://localhost:5000`

---

## 🔑 API Keys

### Using Anthropic (Claude) — Recommended
Set in `.env`:
```
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

### Using OpenAI
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

---

## 🔗 All API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| POST | `/api/tasks` | Create task with steps |
| GET | `/api/tasks/<user_id>` | Get all tasks |
| PUT | `/api/tasks/<task_id>/steps/<step_id>` | Toggle step completion |
| DELETE | `/api/tasks/<task_id>` | Delete task |
| GET | `/api/report/<user_id>` | Get progress report |
| POST | `/api/ai/task-break` | AI breaks task into steps |
| GET | `/api/health` | Health check |

---

## 🖥️ Frontend Integration

### Step 1: Add `api.js` to ALL pages (before any other scripts)
```html
<script src="api.js"></script>
<script src="auth.js"></script>
```

### Step 2: Replace your old JS files with the ones in `frontend_updated/`

### Step 3: That's it! localStorage is gone.

---

## 🤖 AI Task Breaker Example

```js
// In your frontend:
const result = await breakTask("Build a mobile app", true);
// result = { title: "Build a mobile app", steps: [...], task_id: 5 }
```

---

## 🛡️ Fallback Behavior

If the AI API fails (network error, quota exceeded, etc.), the backend automatically returns a set of generic productivity steps — the app never crashes.