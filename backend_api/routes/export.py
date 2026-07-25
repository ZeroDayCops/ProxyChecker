from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend_api.routes.sessions import session_manager

router = APIRouter(prefix="/api/sessions", tags=["export"])

@router.get("/{session_id}/export/{format_type}")
async def export_session(session_id: str, format_type: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    out_dir = Path(session.config.output_dir)
    file_map = {
        "txt": out_dir / "live.txt",
        "csv": out_dir / "statistics.csv",
        "json": out_dir / "summary.json",
        "html": out_dir / "report.html",
        "md": out_dir / "summary.json"
    }

    file_path = file_map.get(format_type.lower())
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Export format {format_type} not generated yet")

    return FileResponse(path=file_path, filename=file_path.name)
