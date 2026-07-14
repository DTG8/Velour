import socketio
from app.config import settings
from app.core.security import decode_access_token
from app.database import SessionLocal
from sqlalchemy import and_
from app.models.message import Message
from app.models.profile import ProviderProfile
from app.models.user import User
from jose import JWTError
import logging

logger = logging.getLogger(__name__)

# Use Redis as the message broker for Socket.io
mgr = socketio.AsyncRedisManager(settings.redis_url)
sio = socketio.AsyncServer(
    async_mode="asgi",
    client_manager=mgr,
    cors_allowed_origins="*"
)

@sio.event
async def connect(sid, environ, auth):
    if not auth or 'token' not in auth:
        return False
    
    try:
        payload = decode_access_token(auth['token'])
        user_id = payload.get("sub")
        if not user_id:
            return False
        
        # Store user info in sid session
        await sio.save_session(sid, {"user_id": int(user_id)})
        
        # Join a room specific to the user for direct messages
        await sio.enter_room(sid, f"user_{user_id}")
        logger.info(f"User {user_id} connected with sid {sid}")
        return True
    except (JWTError, ValueError):
        return False

@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get("user_id") if session else "unknown"
    logger.info(f"User {user_id} disconnected (sid {sid})")

@sio.event
async def send_message(sid, data):
    """
    Data expects: {
        "receiver_id": int,
        "message_text": str
    }
    """
    session = await sio.get_session(sid)
    sender_id = session.get("user_id")
    if not sender_id:
        return
    
    receiver_id = data.get("receiver_id")
    message_text = data.get("message_text")
    
    if not receiver_id or not message_text:
        return

    # Persist to database
    db = SessionLocal()
    try:
        new_msg = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message_text=message_text,
            is_read=False
        )
        db.add(new_msg)
        
        # Get sender profile info for rich payload
        sender_profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == sender_id).first()
        sender_user = db.query(User).filter(User.id == sender_id).first()
        
        db.commit()
        db.refresh(new_msg)
        
        # Emit to receiver and sender
        payload = {
            "id": new_msg.id,
            "sender_id": sender_id,
            "sender_name": sender_profile.display_name if sender_profile else sender_user.username,
            "sender_avatar": sender_profile.avatar_url if sender_profile else None,
            "receiver_id": receiver_id,
            "message_text": message_text,
            "timestamp": new_msg.timestamp.isoformat(),
            "is_read": False
        }
        
        await sio.emit("new_message", payload, room=f"user_{receiver_id}")
        await sio.emit("new_message", payload, room=f"user_{sender_id}")
        
    except Exception as e:
        logger.error(f"Error saving message: {e}")
        db.rollback()
    finally:
        db.close()

@sio.event
async def mark_read(sid, data):
    """
    Data expects: {
        "other_user_id": int
    }
    """
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if not user_id:
        return
        
    other_user_id = data.get("other_user_id")
    if not other_user_id:
        return
        
    db = SessionLocal()
    try:
        db.query(Message).filter(
            and_(Message.sender_id == other_user_id, Message.receiver_id == user_id, Message.is_read == False)
        ).update({Message.is_read: True})
        db.commit()
        
        # Notify other user that their messages were read
        await sio.emit("messages_read", {"reader_id": user_id}, room=f"user_{other_user_id}")
    except Exception as e:
        logger.error(f"Error marking read: {e}")
        db.rollback()
    finally:
        db.close()
