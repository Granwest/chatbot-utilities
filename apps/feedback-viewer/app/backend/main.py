import uvicorn
from fastapi import FastAPI, Query
from cosmos_manager import CosmosManager
from models import HistoryItem, FeedbackItem


from fastapi import Request

app = FastAPI()
cosmos_manager = CosmosManager()

@app.get("/health")
def read_root():
    return {"status": "ok", "detail": "Service is healthy"}



@app.get("/feedback")
def read_feedback(user: str = Query(default=None), type: str = Query(default=None), start_date: int = Query(default=None), end_date: int = Query(default=None)):
    feedback_items = cosmos_manager.get_feedback_items(user=user, type=type, start_date=start_date, end_date=end_date)
    return {"feedback": feedback_items}

@app.get("/feedback/users")
def read_feedback_users():
    feedback_users = cosmos_manager.get_feedback_users()
    return {"users": feedback_users}

@app.get("/history")
def read_history(user: str = Query(default=None), start_date: int = Query(default=None), end_date: int = Query(default=None)):
    history_items = cosmos_manager.get_history_items(user=user, start_date=start_date, end_date=end_date)
    return {"history": history_items}

@app.get("/history/users")
def read_history_users():
    history_users = cosmos_manager.get_history_users()
    return {"users": history_users}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 