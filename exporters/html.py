from pathlib import Path
from typing import List, Dict, Any
from exporters.base import BaseExporter
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

class HtmlExporter(BaseExporter):
    def export(self, live: List[CheckResult], dead: List[CheckResult], invalid: List[ProxyItem], duplicates: List[ProxyItem], summary: Dict[str, Any]):
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ZeroDayCops ProxyChecker Report</title>
    <style>
        body {{
            background: #0f172a;
            color: #f8fafc;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
        }}
        .glass-card {{
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }}
        h1, h2 {{ color: #38bdf8; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }}
        .stat-val {{ font-size: 24px; font-weight: bold; color: #4ade80; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #334155; }}
        th {{ background: #1e293b; color: #94a3b8; }}
    </style>
</head>
<body>
    <div class="glass-card">
        <h1>ZeroDayCops ProxyChecker Session Report</h1>
        <p>Session ID: <strong>{summary.get("session_id", "N/A")}</strong></p>
        <div class="grid">
            <div><div>Loaded</div><div class="stat-val">{summary.get("loaded", 0)}</div></div>
            <div><div>Checked</div><div class="stat-val">{summary.get("checked", 0)}</div></div>
            <div><div>Live</div><div class="stat-val" style="color:#4ade80">{summary.get("live", 0)}</div></div>
            <div><div>Dead</div><div class="stat-val" style="color:#f87171">{summary.get("dead", 0)}</div></div>
            <div><div>Invalid</div><div class="stat-val" style="color:#fbbf24">{summary.get("invalid", 0)}</div></div>
        </div>
    </div>
    <div class="glass-card">
        <h2>Live Proxies Overview</h2>
        <table>
            <thead>
                <tr><th>IP</th><th>Port</th><th>Latency</th><th>Protocol</th></tr>
            </thead>
            <tbody>
                {"".join(f"<tr><td>{item.proxy.ip}</td><td>{item.proxy.port}</td><td>{item.latency_ms} ms</td><td>{item.protocol_detected}</td></tr>" for item in live[:100])}
            </tbody>
        </table>
    </div>
</body>
</html>
"""
        with open(self.output_dir / "report.html", "w", encoding="utf-8") as f:
            f.write(html_content)
