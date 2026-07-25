import asyncio
import time
import psutil
from typing import List, Callable, Optional, Dict, Any
from engine.dedupe import ProxyItem
from engine.checker import ProxyCheckerWorker, CheckResult

class EngineScheduler:
    def __init__(self, workers_count: int = 100, timeout: float = 5.0, retry_count: int = 2):
        self.workers_count = workers_count
        self.worker = ProxyCheckerWorker(timeout=timeout, retry_count=retry_count)
        self.is_paused = False
        self.is_stopped = False
        
        # Metrics state
        self.total_checked = 0
        self.live_count = 0
        self.dead_count = 0
        self.total_latency_ms = 0.0
        self.fastest_ms = float('inf')
        self.slowest_ms = 0.0
        self.start_time = 0.0
        self.end_time = 0.0

        # Rolling sample histories for sparklines (60 samples)
        self.checks_per_sec_history: List[float] = [0.0] * 60
        self.success_rate_history: List[float] = [0.0] * 60
        self.avg_latency_history: List[float] = [0.0] * 60
        self.cpu_usage_history: List[float] = [0.0] * 60
        self.memory_usage_history: List[float] = [0.0] * 60
        self.network_throughput_history: List[float] = [0.0] * 60

    async def run(self, proxies: List[ProxyItem], callback: Optional[Callable[[CheckResult], None]] = None) -> List[CheckResult]:
        self.start_time = time.perf_counter()
        results: List[CheckResult] = []
        queue: asyncio.Queue = asyncio.Queue()

        for item in proxies:
            await queue.put(item)

        async def worker_task():
            while not queue.empty() and not self.is_stopped:
                while self.is_paused and not self.is_stopped:
                    await asyncio.sleep(0.1)

                try:
                    item = queue.get_nowait()
                except asyncio.QueueEmpty:
                    break

                res = await self.worker.check_proxy(item)
                
                # Metrics update
                self.total_checked += 1
                if res.is_live:
                    self.live_count += 1
                    self.total_latency_ms += res.latency_ms
                    self.fastest_ms = min(self.fastest_ms, res.latency_ms)
                    self.slowest_ms = max(self.slowest_ms, res.latency_ms)
                else:
                    self.dead_count += 1

                results.append(res)
                if callback:
                    callback(res)

                queue.task_done()

        tasks = [asyncio.create_task(worker_task()) for _ in range(min(self.workers_count, len(proxies) or 1))]
        await asyncio.gather(*tasks)
        self.end_time = time.perf_counter()
        return results

    def update_resource_metrics(self, current_cps: float):
        self.checks_per_sec_history.append(current_cps)
        self.checks_per_sec_history.pop(0)

        success_rate = (self.live_count / self.total_checked * 100.0) if self.total_checked > 0 else 0.0
        self.success_rate_history.append(success_rate)
        self.success_rate_history.pop(0)

        avg_lat = (self.total_latency_ms / self.live_count) if self.live_count > 0 else 0.0
        self.avg_latency_history.append(avg_lat)
        self.avg_latency_history.pop(0)

        self.cpu_usage_history.append(psutil.cpu_percent())
        self.cpu_usage_history.pop(0)

        self.memory_usage_history.append(psutil.virtual_memory().percent)
        self.memory_usage_history.pop(0)

        net_io = psutil.net_io_counters()
        bytes_sent_recv = (net_io.bytes_sent + net_io.bytes_recv) / 1024.0 # KB
        self.network_throughput_history.append(bytes_sent_recv)
        self.network_throughput_history.pop(0)
