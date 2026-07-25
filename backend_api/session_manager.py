import asyncio
import time
from typing import Dict, Optional, List
from engine.core import EngineScheduler
from engine.dedupe import Deduplicator, ProxyItem
from engine.checker import CheckResult
from backend_api.schemas import SessionConfig, DashboardFrame, DashboardGraphData, ProxyRow, SessionSummary

class ActiveSession:
    def __init__(self, session_id: str, proxies: List[ProxyItem], invalid_proxies: List[ProxyItem], config: SessionConfig):
        self.session_id = session_id
        self.proxies = proxies
        self.invalid_proxies = invalid_proxies
        self.config = config
        self.scheduler = EngineScheduler(
            workers_count=config.workers or 100,
            timeout=config.timeout,
            retry_count=config.retry_count
        )
        self.task: Optional[asyncio.Task] = None
        self.recent_rows: List[ProxyRow] = []
        self.results: List[CheckResult] = []

    def on_result(self, res: CheckResult):
        self.results.append(res)
        row = ProxyRow(
            ip=res.proxy.ip,
            port=res.proxy.port,
            protocol=res.protocol_detected,
            status="live" if res.is_live else "dead",
            latency_ms=res.latency_ms
        )
        self.recent_rows.append(row)
        if len(self.recent_rows) > 50:
            self.recent_rows.pop(0)

    async def start(self):
        self.task = asyncio.create_task(self.scheduler.run(self.proxies, callback=self.on_result))

    def pause(self):
        self.scheduler.is_paused = True

    def resume(self):
        self.scheduler.is_paused = False

    def stop(self):
        self.scheduler.is_stopped = True

    def get_frame(self) -> DashboardFrame:
        checked = self.scheduler.total_checked
        loaded = len(self.proxies)
        remaining = max(0, loaded - checked)
        elapsed = int(time.perf_counter() - self.scheduler.start_time) if self.scheduler.start_time > 0 else 0
        speed_current = self.scheduler.checks_per_sec_history[-1] if self.scheduler.checks_per_sec_history else 0.0
        speed_avg = checked / elapsed if elapsed > 0 else 0.0
        eta = int(remaining / speed_avg) if speed_avg > 0 else 0

        self.scheduler.update_resource_metrics(speed_current)

        return DashboardFrame(
            session_id=self.session_id,
            loaded=loaded,
            checked=checked,
            remaining=remaining,
            live=self.scheduler.live_count,
            dead=self.scheduler.dead_count,
            invalid=len(self.invalid_proxies),
            speed_current=speed_current,
            speed_avg=round(speed_avg, 2),
            elapsed_sec=elapsed,
            eta_sec=eta,
            graphs=DashboardGraphData(
                cps=list(self.scheduler.checks_per_sec_history),
                success_rate=list(self.scheduler.success_rate_history),
                latency_ms=list(self.scheduler.avg_latency_history),
                cpu_pct=list(self.scheduler.cpu_usage_history),
                mem_pct=list(self.scheduler.memory_usage_history),
                net_kbps=list(self.scheduler.network_throughput_history)
            ),
            recent_rows=list(self.recent_rows)
        )

    def get_summary(self) -> SessionSummary:
        elapsed = int(self.scheduler.end_time - self.scheduler.start_time) if self.scheduler.end_time > 0 else 1
        avg_lat = int(self.scheduler.total_latency_ms / self.scheduler.live_count) if self.scheduler.live_count > 0 else 0
        fastest = int(self.scheduler.fastest_ms) if self.scheduler.fastest_ms != float('inf') else 0
        slowest = int(self.scheduler.slowest_ms)
        speed = int(self.scheduler.total_checked / elapsed) if elapsed > 0 else 0
        
        hours, rem = divmod(elapsed, 3600)
        minutes, seconds = divmod(rem, 60)
        duration_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

        return SessionSummary(
            session_id=self.session_id,
            loaded=len(self.proxies),
            checked=self.scheduler.total_checked,
            live=self.scheduler.live_count,
            dead=self.scheduler.dead_count,
            invalid=len(self.invalid_proxies),
            avg_latency_ms=avg_lat,
            fastest_ms=fastest,
            slowest_ms=slowest,
            duration=duration_str,
            average_speed_cps=speed
        )

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, ActiveSession] = {}

    def create_session(self, session_id: str, proxies: List[ProxyItem], invalid_proxies: List[ProxyItem], config: SessionConfig) -> ActiveSession:
        session = ActiveSession(session_id, proxies, invalid_proxies, config)
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[ActiveSession]:
        return self.sessions.get(session_id)
