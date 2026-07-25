from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend_api.schemas import SessionConfig
from backend_api.routes.upload import uploaded_store
from backend_api.session_manager import SessionManager

router = APIRouter(prefix="/api/sessions", tags=["sessions"])
session_manager = SessionManager()

@router.post("")
async def create_session(file_id: str, config: SessionConfig):
    store = uploaded_store.get(file_id)
    if not store:
        raise HTTPException(status_code=404, detail="Uploaded file_id not found")

    session_id = datetime.now().strftime("%Y%m%d-001")
    session = session_manager.create_session(
        session_id=session_id,
        proxies=store["valid"],
        invalid_proxies=store["invalid"],
        config=config
    )
    await session.start()
    return {"session_id": session_id, "status": "started"}

@router.get("/{session_id}")
async def get_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.get_frame()
