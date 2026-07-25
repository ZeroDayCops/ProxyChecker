from pathlib import Path
from typing import List, Dict, Any
from exporters.base import BaseExporter
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

class TxtExporter(BaseExporter):
    def export(self, live: List[CheckResult], dead: List[CheckResult], invalid: List[ProxyItem], duplicates: List[ProxyItem], summary: Dict[str, Any]):
        with open(self.output_dir / "live.txt", "w", encoding="utf-8") as f:
            for item in live:
                f.write(f"{item.proxy.raw}\n")

        with open(self.output_dir / "dead.txt", "w", encoding="utf-8") as f:
            for item in dead:
                f.write(f"{item.proxy.raw}\n")

        with open(self.output_dir / "invalid.txt", "w", encoding="utf-8") as f:
            for item in invalid:
                f.write(f"{item.raw}\n")

        with open(self.output_dir / "duplicates.txt", "w", encoding="utf-8") as f:
            for item in duplicates:
                f.write(f"{item.raw}\n")
