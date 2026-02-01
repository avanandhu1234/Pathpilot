"""AI usage tracking + Career Guidance chat (conversations, limits)."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.ai_usage import AIUsage
from models.conversation import Conversation, Message
from models.resume import Resume
from schemas.ai_usage import AIUsageIncrement, AIUsageStatus
from schemas.chat import ChatRequest, ChatResponse, MessageResponse, ConversationResponse
from routers.auth import get_current_user
from models.user import User
from services.llm import chat_completion

router = APIRouter()

CAREER_CHAT_LIMITS = {"free": 10, "pro": None, "premium": None}  # None = unlimited


@router.post("/usage/increment")
def ai_usage_increment(
    body: AIUsageIncrement,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Increment usage count for a feature (resume_ai / career_chat) for the current month."""
    from datetime import datetime
    month = datetime.utcnow().strftime("%Y-%m")
    row = db.query(AIUsage).filter(
        AIUsage.user_id == user.id,
        AIUsage.feature == body.feature,
        AIUsage.month == month,
    ).first()
    if not row:
        row = AIUsage(user_id=user.id, feature=body.feature, count=0, month=month)
        db.add(row)
    row.count = (row.count or 0) + 1
    db.commit()
    return {"ok": True, "feature": body.feature, "count": row.count}


@router.get("/usage/status", response_model=list[AIUsageStatus])
def ai_usage_status(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return usage status for the current user (all features, current month)."""
    month = datetime.utcnow().strftime("%Y-%m")
    rows = db.query(AIUsage).filter(
        AIUsage.user_id == user.id,
        AIUsage.month == month,
    ).all()
    return [AIUsageStatus(feature=r.feature, count=r.count or 0, month=r.month) for r in rows]


def _career_chat_usage(db: Session, user_id: int) -> int:
    month = datetime.utcnow().strftime("%Y-%m")
    row = db.query(AIUsage).filter(
        AIUsage.user_id == user_id,
        AIUsage.feature == "career_chat",
        AIUsage.month == month,
    ).first()
    return (row.count or 0) if row else 0


def _career_chat_limit(plan: str) -> int | None:
    return CAREER_CHAT_LIMITS.get((plan or "free").lower())


def _user_profile_for_chat(db: Session, user_id: int) -> str:
    """Build short user profile from latest resume for context."""
    r = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).first()
    if not r or not r.resume_text:
        return "No resume on file."
    text = (r.resume_text or "")[:1500]
    return f"User's resume (excerpt): {text}"


@router.post("/chat", response_model=ChatResponse)
def career_chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Career Guidance chatbot. Builds prompt from user profile + conversation history.
    Tracks AI usage, enforces plan limits, stores conversations.
    """
    limit = _career_chat_limit(user.plan)
    used = _career_chat_usage(db, user.id)
    if limit is not None and used >= limit:
        raise HTTPException(
            status_code=403,
            detail={"code": "plan_limit", "message": f"Career chat limit reached ({limit}/month). Upgrade for more."},
        )

    conv_id = body.conversation_id
    if conv_id is not None:
        conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user.id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(user_id=user.id, title="Career guidance")
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id

    history = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.id.asc())
        .all()
    )
    profile = _user_profile_for_chat(db, user.id)
    system = (
        "You are a supportive career coach. Help with career goals, job search, skills, and advice. "
        "Be concise and actionable. "
        f"Context about the user: {profile}"
    )
    messages_for_llm = [{"role": "system", "content": system}]
    for m in history:
        messages_for_llm.append({"role": m.role, "content": m.content or ""})
    messages_for_llm.append({"role": "user", "content": body.message})

    user_msg = Message(conversation_id=conv_id, role="user", content=body.message)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    reply = chat_completion(messages_for_llm, max_tokens=1024)

    assistant_msg = Message(conversation_id=conv_id, role="assistant", content=reply)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    month = datetime.utcnow().strftime("%Y-%m")
    usage_row = (
        db.query(AIUsage)
        .filter(AIUsage.user_id == user.id, AIUsage.feature == "career_chat", AIUsage.month == month)
        .first()
    )
    if not usage_row:
        usage_row = AIUsage(user_id=user.id, feature="career_chat", count=0, month=month)
        db.add(usage_row)
    usage_row.count = (usage_row.count or 0) + 1
    db.commit()

    remaining = None if limit is None else max(0, limit - usage_row.count)

    return ChatResponse(
        conversation_id=conv_id,
        message_id=assistant_msg.id,
        role="assistant",
        content=reply,
        usage_remaining=remaining,
    )


@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List user's career guidance conversations."""
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [ConversationResponse.model_validate(c) for c in convs]


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get messages for a conversation."""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.id.asc()).all()
    return [MessageResponse.model_validate(m) for m in msgs]
