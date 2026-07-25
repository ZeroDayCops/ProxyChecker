from fastapi import APIRouter, HTTPException
from backend_api.routes.sessions import session_manager

router = APIRouter(prefix="/api/sessions", tags=["control"])

@router.post("/{session_id}/pause")
async def pause_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.pause()
    return {"status": "paused"}

@router.post("/{session_id}/resume")
async def resume_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.resume()
    return {"status": "resumed"}

@router.post("/{session_id}/stop")
async def stop_session(session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.stop()
    return {"status": "stopped"}
