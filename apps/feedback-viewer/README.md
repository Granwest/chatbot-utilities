# Feedback Viewer Project

This project contains a React frontend and a Python FastAPI backend.

## Structure
- `frontend/` - React app (bootstrapped with Create React App)
- `backend/` - Python FastAPI app (with .venv virtual environment)

## Getting Started

### Frontend
```
cd frontend
npm start
```

### Backend
```
cd backend
# Activate the virtual environment (Windows)
.\.venv\Scripts\activate

# Run the FastAPI app
uvicorn main:app --reload
```

The backend will be available at http://127.0.0.1:8000
The frontend will be available at http://localhost:3000

---

Replace the placeholder API in `backend/main.py` with your own endpoints as needed.
