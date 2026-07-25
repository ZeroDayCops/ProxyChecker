import json
import logging
from pathlib import Path
from typing import Dict, Any

class LoggerSetup:
    def __init__(self, log_dir: Path = Path("logging_"), level: str = "INFO"):
        self.log_dir = log_dir
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.level = getattr(logging, level.upper(), logging.INFO)
        
        self._setup_debug_logger()
        self._setup_error_logger()
        self._setup_perf_logger()

    def _setup_debug_logger(self):
        self.debug_logger = logging.getLogger("ProxyChecker.Debug")
        self.debug_logger.setLevel(logging.DEBUG)
        fh = logging.FileHandler(self.log_dir / "debug.log", encoding="utf-8")
        formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s")
        fh.setFormatter(formatter)
        self.debug_logger.addHandler(fh)

    def _setup_error_logger(self):
        self.error_logger = logging.getLogger("ProxyChecker.Error")
        self.error_logger.setLevel(logging.ERROR)
        fh = logging.FileHandler(self.log_dir / "error.log", encoding="utf-8")
        formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s")
        fh.setFormatter(formatter)
        self.error_logger.addHandler(fh)

    def _setup_perf_logger(self):
        self.perf_logger = logging.getLogger("ProxyChecker.Perf")
        self.perf_logger.setLevel(logging.INFO)
        fh = logging.FileHandler(self.log_dir / "performance.log", encoding="utf-8")
        formatter = logging.Formatter("[%(asctime)s] %(message)s")
        fh.setFormatter(formatter)
        self.perf_logger.addHandler(fh)

    def log_session_history(self, session_data: Dict[str, Any]):
        history_file = self.log_dir / "session_history.jsonl"
        with open(history_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(session_data) + "\n")
