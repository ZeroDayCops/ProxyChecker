import json
import time
from pathlib import Path
from typing import Dict, Any, Optional

class CacheManager:
    def __init__(self, cache_file: Path = Path("cache.py_checkpoint.json"), ttl_seconds: int = 86400):
        self.cache_file = cache_file
        self.ttl_seconds = ttl_seconds
        self.data: Dict[str, Dict[str, Any]] = self._load()

    def _load(self) -> Dict[str, Dict[str, Any]]:
        if not self.cache_file.exists():
            return {}
        try:
            with open(self.cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def save(self):
        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2)

    def get(self, proxy_key: str) -> Optional[Dict[str, Any]]:
        entry = self.data.get(proxy_key)
        if not entry:
            return None
        timestamp = entry.get("timestamp", 0)
        if time.time() - timestamp > self.ttl_seconds:
            # Expired
            del self.data[proxy_key]
            return None
        return entry.get("result")

    def set(self, proxy_key: str, result: Dict[str, Any]):
        self.data[proxy_key] = {
            "timestamp": time.time(),
            "result": result
        }

    def clear(self):
        self.data.clear()
        if self.cache_file.exists():
            self.cache_file.unlink()
