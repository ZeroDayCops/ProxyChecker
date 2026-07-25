import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/api/sessions", tags=["history"])

@router.get("")
async def get_history():
    history_file = Path("logging_") / "session_history.jsonl"
    entries = []
    if history_file.exists():
        with open(history_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        entries.append(json.loads(line))
                    except Exception:
                        pass
    return entries
