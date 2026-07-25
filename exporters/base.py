from pathlib import Path
from typing import List, Dict, Any
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

class BaseExporter:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export(self, live: List[CheckResult], dead: List[CheckResult], invalid: List[ProxyItem], duplicates: List[ProxyItem], summary: Dict[str, Any]):
        raise NotImplementedError
