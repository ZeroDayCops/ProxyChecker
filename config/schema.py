import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Union, Optional, List

@dataclass
class AppConfig:
    timeout: float = 5.0
    concurrency: Union[int, str] = "auto"
    workers: Optional[int] = None
    retry_count: int = 2
    output_dir: str = "./results"
    logging_level: str = "INFO"
    proxy_type: str = "all"  # http, https, socks4, socks5, all
    ttl_seconds: int = 86400
    export: List[str] = field(default_factory=lambda: ["all"])
    resume: bool = False
    benchmark: bool = False
    compact: bool = False
    verbose: bool = False
    config_file: Optional[str] = None
    input_file: Optional[str] = None

    def resolve_workers(self) -> int:
        if self.workers is not None:
            return self.workers
        if isinstance(self.concurrency, int):
            return self.concurrency
        # Auto mode defaults based on CPU cores
        cpu_count = os.cpu_count() or 4
        return min(500, cpu_count * 50)

    @classmethod
    def load_from_json(cls, path: Path) -> "AppConfig":
        if not path.exists():
            return cls()
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls(**{k: v for k, v in data.items() if k in cls.__annotations__})
