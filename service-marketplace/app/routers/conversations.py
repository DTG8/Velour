from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from typing import List
from app.dependencies import get_db, get_current_user
from app.models.message import Message
from app.models.user import User
from app.models.profile import ProviderProfile
from app.schemas.message import ConversationRead

router = APIRouter(prefix="/messages/conversations", tags=["Conversations"])

@router.get("/", response_model=List[ConversationRead])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of all unique users the current user has chatted with,
    along with the last message, unread count, and partner profile info.
    """
    # 1. Find all unique partners
    # We query for all messages where the user is sender or receiver
    # Then we find the max timestamp per partner
    
    # Subquery to find last message timestamp for each conversation
    # We need to consider both directions
    
    # Actually, a cleaner way is to find all unique "other_user_id"s first
    # and then for each, get the details.
    
    # Get all user IDs the current user has messaged or received messages from
    senders = db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct().all()
    receivers = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct().all()
    
    partner_ids = set([s[0] for s in senders] + [r[0] for r in receivers])
    
    results = []
    for partner_id in partner_ids:
        # Get partner info
        partner = db.query(User).filter(User.id == partner_id).first()
        if not partner:
            continue
            
        # Get last message
        last_msg = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id)
            )
        ).order_by(desc(Message.timestamp)).first()
        
        if not last_msg:
            continue
            
        # Get unread count
        unread_count = db.query(func.count(Message.id)).filter(
            and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id, Message.is_read == False)
        ).scalar()
        
        # Get partner profile (if they are a provider)
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == partner_id).first()
        
        results.append(ConversationRead(
            other_user_id=partner_id,
            other_username=partner.username,
            other_display_name=profile.display_name if profile else partner.username,
            other_avatar_url=profile.avatar_url if profile else None,
            other_is_online=profile.is_online if profile else False,
            last_message_text=last_msg.message_text,
            last_message_time=last_msg.timestamp,
            last_message_sender_id=last_msg.sender_id,
            unread_count=unread_count
        ))
        
    # Sort by last message time
    results.sort(key=lambda x: x.last_message_time, reverse=True)
    
    return results
