from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SessionConfig(BaseModel):
    timeout: float = 5.0
    workers: Optional[int] = None
    retry_count: int = 2
    proxy_type: str = "all"
    output_dir: str = "./results"

class UploadResponse(BaseModel):
    file_id: str
    loaded_count: int
    valid_count: int
    invalid_count: int
    duplicate_count: int

class ProxyRow(BaseModel):
    ip: str
    port: int
    protocol: str = "http"
    status: str = "live"
    latency_ms: float = 0.0
    country: str = "Unknown"
    asn: str = "Unknown"

class DashboardGraphData(BaseModel):
    cps: List[float]
    success_rate: List[float]
    latency_ms: List[float]
    cpu_pct: List[float]
    mem_pct: List[float]
    net_kbps: List[float]

class DashboardFrame(BaseModel):
    type: str = "dashboard_frame"
    session_id: str
    loaded: int
    checked: int
    remaining: int
    live: int
    dead: int
    invalid: int
    speed_current: float
    speed_avg: float
    elapsed_sec: int
    eta_sec: int
    graphs: DashboardGraphData
    recent_rows: List[ProxyRow]

class SessionSummary(BaseModel):
    session_id: str
    loaded: int
    checked: int
    live: int
    dead: int
    invalid: int
    avg_latency_ms: int
    fastest_ms: int
    slowest_ms: int
    duration: str
    average_speed_cps: int
