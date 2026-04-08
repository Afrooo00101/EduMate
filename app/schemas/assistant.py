from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    message: str
    channel: str = 'chat'


class ChatMessageRead(BaseModel):
    id: int
    channel: str
    user_message: str
    assistant_message: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
