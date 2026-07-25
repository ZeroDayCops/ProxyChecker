import csv
from pathlib import Path
from typing import List, Dict, Any
from exporters.base import BaseExporter
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

class CsvExporter(BaseExporter):
    def export(self, live: List[CheckResult], dead: List[CheckResult], invalid: List[ProxyItem], duplicates: List[ProxyItem], summary: Dict[str, Any]):
        with open(self.output_dir / "statistics.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["IP", "Port", "Status", "LatencyMS", "Protocol", "Error"])
            for item in live:
                writer.writerow([item.proxy.ip, item.proxy.port, "LIVE", item.latency_ms, item.protocol_detected, ""])
            for item in dead:
                writer.writerow([item.proxy.ip, item.proxy.port, "DEAD", item.latency_ms, item.protocol_detected, item.error or ""])
