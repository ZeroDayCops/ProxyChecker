from pathlib import Path
import json
from exporters.txt import TxtExporter
from exporters.csv import CsvExporter
from exporters.json import JsonExporter
from exporters.html import HtmlExporter
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

def test_exporters(tmp_path):
    output_dir = tmp_path / "results"
    
    live = [CheckResult(proxy=ProxyItem(raw="1.1.1.1:80", ip="1.1.1.1", port=80), is_live=True, latency_ms=120.0, protocol_detected="http")]
    dead = [CheckResult(proxy=ProxyItem(raw="2.2.2.2:80", ip="2.2.2.2", port=80), is_live=False, error="Timeout")]
    invalid = [ProxyItem(raw="invalid", ip="", port=0, is_valid=False)]
    duplicates = [ProxyItem(raw="1.1.1.1:80", ip="1.1.1.1", port=80, is_duplicate=True)]
    summary = {"session_id": "TEST", "loaded": 4, "checked": 3, "live": 1, "dead": 1, "invalid": 1}

    TxtExporter(output_dir).export(live, dead, invalid, duplicates, summary)
    CsvExporter(output_dir).export(live, dead, invalid, duplicates, summary)
    JsonExporter(output_dir).export(live, dead, invalid, duplicates, summary)
    HtmlExporter(output_dir).export(live, dead, invalid, duplicates, summary)

    assert (output_dir / "live.txt").exists()
    assert (output_dir / "dead.txt").exists()
    assert (output_dir / "invalid.txt").exists()
    assert (output_dir / "duplicates.txt").exists()
    assert (output_dir / "statistics.csv").exists()
    assert (output_dir / "summary.json").exists()
    assert (output_dir / "report.html").exists()
