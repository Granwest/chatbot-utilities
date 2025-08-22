from typing import Optional
from pydantic import BaseModel

class HistoryItem(BaseModel):
    id: str
    session_id: str
    entra_oid: str
    timestamp: str
    question: str
    rewritten_question: Optional[str] = None
    answer: str

class FeedbackItem(BaseModel):
    id: str
    session_id: str
    entra_oid: str
    timestamp: str
    question: str
    rewritten_question: Optional[str] = None
    answer: str
    type: str
    text: str