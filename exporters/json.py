import json
from pathlib import Path
from typing import List, Dict, Any
from exporters.base import BaseExporter
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

class JsonExporter(BaseExporter):
    def export(self, live: List[CheckResult], dead: List[CheckResult], invalid: List[ProxyItem], duplicates: List[ProxyItem], summary: Dict[str, Any]):
        out_data = {
            "summary": summary,
            "live_proxies": [
                {
                    "ip": item.proxy.ip,
                    "port": item.proxy.port,
                    "latency_ms": item.latency_ms,
                    "protocol": item.protocol_detected
                } for item in live
            ]
        }
        with open(self.output_dir / "summary.json", "w", encoding="utf-8") as f:
            json.dump(out_data, f, indent=2)
