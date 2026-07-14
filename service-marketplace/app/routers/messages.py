from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from app.dependencies import get_db, get_current_user
from app.models.message import Message
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/messages", tags=["Messages"])

from app.schemas.message import MessageRead

@router.get("/{other_user_id}", response_model=List[MessageRead])
def get_chat_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve chat history between current user and another user.
    Privacy is enforced because current_user is obtained from JWT.
    Also marks incoming messages as read.
    """
    # 1. Fetch messages
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.timestamp.asc()).all()
    
    # 2. Mark incoming messages as read
    db.query(Message).filter(
        and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id, Message.is_read == False)
    ).update({Message.is_read: True})
    db.commit()
    
    return messages
