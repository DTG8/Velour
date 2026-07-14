from datetime import datetime
from pydantic import BaseModel

class MessageRead(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message_text: str
    is_read: bool
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationRead(BaseModel):
    other_user_id: int
    other_username: str
    other_display_name: str | None
    other_avatar_url: str | None
    other_is_online: bool
    last_message_text: str
    last_message_time: datetime
    last_message_sender_id: int
    unread_count: int

    class Config:
        from_attributes = True
