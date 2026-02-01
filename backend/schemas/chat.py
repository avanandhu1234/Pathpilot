from datetime import datetime
from pydantic import BaseModel


class ChatMessageSchema(BaseModel):
    role: str  # user / assistant / system
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    role: str = "assistant"
    content: str
    usage_remaining: int | None = None


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    title: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
