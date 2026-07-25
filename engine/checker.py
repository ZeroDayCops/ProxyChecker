import asyncio
import time
import aiohttp
from dataclasses import dataclass
from typing import Optional, Dict, Any
from engine.dedupe import ProxyItem

SAFE_TEST_ENDPOINTS = [
    "http://httpbin.org/ip",
    "http://ip-api.com/json"
]

@dataclass
class CheckResult:
    proxy: ProxyItem
    is_live: bool
    latency_ms: float = 0.0
    status_code: int = 0
    error: Optional[str] = None
    anonymity: str = "Unknown"  # Transparent, Anonymous, Elite
    protocol_detected: str = "http"

class ProxyCheckerWorker:
    def __init__(self, timeout: float = 5.0, retry_count: int = 2):
        self.timeout = timeout
        self.retry_count = retry_count

    async def check_proxy(self, item: ProxyItem, target_url: str = "http://httpbin.org/ip") -> CheckResult:
        if not item.is_valid:
            return CheckResult(proxy=item, is_live=False, error="Invalid format")

        proxy_url = item.to_url(default_protocol=item.protocol or "http")
        
        for attempt in range(self.retry_count + 1):
            start_time = time.perf_counter()
            try:
                timeout = aiohttp.ClientTimeout(total=self.timeout)
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.get(target_url, proxy=proxy_url) as resp:
                        elapsed = (time.perf_counter() - start_time) * 1000.0
                        if resp.status == 200:
                            return CheckResult(
                                proxy=item,
                                is_live=True,
                                latency_ms=round(elapsed, 2),
                                status_code=resp.status,
                                protocol_detected=item.protocol or "http"
                            )
            except Exception as e:
                if attempt == self.retry_count:
                    elapsed = (time.perf_counter() - start_time) * 1000.0
                    return CheckResult(
                        proxy=item,
                        is_live=False,
                        latency_ms=round(elapsed, 2),
                        error=str(e)
                    )
                await asyncio.sleep(0.1 * (2 ** attempt))
        return CheckResult(proxy=item, is_live=False, error="Unknown failure")
