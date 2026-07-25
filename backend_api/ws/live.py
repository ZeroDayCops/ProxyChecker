import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend_api.routes.sessions import session_manager

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/sessions/{session_id}")
async def websocket_session_live(websocket: WebSocket, session_id: str):
    await websocket.accept()
    session = session_manager.get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found")
        return

    try:
        while True:
            frame = session.get_frame()
            await websocket.send_json(frame.model_dump())
            
            if session.scheduler.total_checked >= len(session.proxies) or session.scheduler.is_stopped:
                # Session completed
                summary = session.get_summary()
                await websocket.send_json({
                    "type": "session_complete",
                    "summary": summary.model_dump()
                })
                break
                
            await asyncio.sleep(0.25) # 4Hz stream
    except WebSocketDisconnect:
        pass
