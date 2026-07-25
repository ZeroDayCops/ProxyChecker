#!/usr/bin/env python3
import argparse
import asyncio
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from config.schema import AppConfig
from logging_.logger import LoggerSetup
from engine.dedupe import Deduplicator, ProxyItem
from engine.core import EngineScheduler
from engine.checker import CheckResult
from engine.cache import CacheManager
from exporters.txt import TxtExporter
from exporters.csv import CsvExporter
from exporters.json import JsonExporter
from exporters.html import HtmlExporter
from plugins.manager import PluginManager

__version__ = "1.0.0"

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="checker",
        description="ZeroDayCops ProxyChecker - High Performance Terminal Proxy Validator"
    )
    parser.add_argument("input_file", nargs="?", help="Path to text file containing proxies")
    parser.add_argument("--timeout", type=float, default=5.0, help="Connection timeout in seconds (default: 5)")
    parser.add_argument("--workers", type=int, default=None, help="Worker pool concurrency count")
    parser.add_argument("--export", type=str, default="all", help="Export formats comma separated (txt,csv,json,html,md,all)")
    parser.add_argument("--resume", action="store_true", help="Resume interrupted scan from checkpoint cache")
    parser.add_argument("--config", type=str, default=None, help="Path to JSON configuration file")
    parser.add_argument("--proxy-type", type=str, default="all", choices=["http", "https", "socks4", "socks5", "all"], help="Proxy protocol target")
    parser.add_argument("--output-dir", type=str, default="./results", help="Directory for output export files")
    parser.add_argument("--log-level", type=str, default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"], help="Logging level")
    parser.add_argument("--benchmark", action="store_true", help="Run benchmark mode with synthetic engine")
    parser.add_argument("--compact", action="store_true", help="Display compact TUI view (counters only)")
    parser.add_argument("--verbose", action="store_true", help="Display verbose TUI view (+ log tail & graphs)")
    return parser

def print_session_summary(session_id: str, loaded: int, checked: int, live: int, dead: int, invalid: int, avg_lat: int, fastest: int, slowest: int, duration_str: str, speed: int):
    print(f"""
Session ID: {session_id}

Loaded: {loaded}
Checked: {checked}

Live: {live}
Dead: {dead}
Invalid: {invalid}

Average Latency: {avg_lat} ms
Fastest: {fastest} ms
Slowest: {slowest} ms

Duration: {duration_str}
Average Speed: {speed} proxies/sec
""")

async def run_checker(config: AppConfig):
    session_id = datetime.now().strftime("%Y%m%d-001")
    logger = LoggerSetup(log_dir=Path("logging_"), level=config.logging_level)
    logger.debug_logger.info(f"Starting ProxyChecker session {session_id}")

    cache = CacheManager(ttl_seconds=config.ttl_seconds)

    if config.benchmark:
        print("[*] Benchmark mode active: generating 500 synthetic proxies...")
        raw_lines = [f"127.0.0.1:{8000 + i}" for i in range(500)]
    else:
        if not config.input_file or not Path(config.input_file).exists():
            print(f"Error: Input file '{config.input_file}' not found.")
            sys.exit(1)
        with open(config.input_file, "r", encoding="utf-8", errors="ignore") as f:
            raw_lines = f.readlines()

    loaded_count = len(raw_lines)
    valid_proxies, invalid_proxies, duplicate_proxies = Deduplicator.process_proxies(raw_lines)

    plugin_mgr = PluginManager()
    valid_proxies = plugin_mgr.run_pre_check(valid_proxies)

    if config.resume:
        valid_proxies = [p for p in valid_proxies if not cache.get(p.key)]

    workers = config.resolve_workers()
    scheduler = EngineScheduler(workers_count=workers, timeout=config.timeout, retry_count=config.retry_count)

    start_time = time.perf_counter()

    if config.benchmark:
        # Synthetic fast check simulation
        results: List[CheckResult] = []
        for idx, item in enumerate(valid_proxies):
            is_live = (idx % 3 != 0)
            lat = 40.0 + (idx % 150)
            res = CheckResult(proxy=item, is_live=is_live, latency_ms=lat, protocol_detected="http")
            if is_live:
                scheduler.live_count += 1
                scheduler.total_latency_ms += lat
                scheduler.fastest_ms = min(scheduler.fastest_ms, lat)
                scheduler.slowest_ms = max(scheduler.slowest_ms, lat)
            else:
                scheduler.dead_count += 1
            scheduler.total_checked += 1
            results.append(res)
            cache.set(item.key, {"is_live": is_live, "latency_ms": lat})
    else:
        results = await scheduler.run(valid_proxies)
        for res in results:
            cache.set(res.proxy.key, {"is_live": res.is_live, "latency_ms": res.latency_ms})

    cache.save()
    results = plugin_mgr.run_post_check(results)

    elapsed_sec = time.perf_counter() - start_time
    checked_count = len(results)

    live_results = [r for r in results if r.is_live]
    dead_results = [r for r in results if not r.is_live]

    avg_lat = int(scheduler.total_latency_ms / scheduler.live_count) if scheduler.live_count > 0 else 0
    fastest = int(scheduler.fastest_ms) if scheduler.fastest_ms != float('inf') else 0
    slowest = int(scheduler.slowest_ms)

    hours, rem = divmod(int(elapsed_sec), 3600)
    minutes, seconds = divmod(rem, 60)
    duration_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    speed = int(checked_count / elapsed_sec) if elapsed_sec > 0 else checked_count

    summary_data = {
        "session_id": session_id,
        "loaded": loaded_count,
        "checked": checked_count,
        "live": scheduler.live_count,
        "dead": scheduler.dead_count,
        "invalid": len(invalid_proxies),
        "avg_latency_ms": avg_lat,
        "fastest_ms": fastest,
        "slowest_ms": slowest,
        "duration": duration_str,
        "average_speed_cps": speed
    }

    out_dir = Path(config.output_dir)
    TxtExporter(out_dir).export(live_results, dead_results, invalid_proxies, duplicate_proxies, summary_data)
    CsvExporter(out_dir).export(live_results, dead_results, invalid_proxies, duplicate_proxies, summary_data)
    JsonExporter(out_dir).export(live_results, dead_results, invalid_proxies, duplicate_proxies, summary_data)
    HtmlExporter(out_dir).export(live_results, dead_results, invalid_proxies, duplicate_proxies, summary_data)

    logger.log_session_history(summary_data)
    print_session_summary(
        session_id=session_id,
        loaded=loaded_count,
        checked=checked_count,
        live=scheduler.live_count,
        dead=scheduler.dead_count,
        invalid=len(invalid_proxies),
        avg_lat=avg_lat,
        fastest=fastest,
        slowest=slowest,
        duration_str=duration_str,
        speed=speed
    )

def main():
    parser = build_parser()
    args = parser.parse_args()

    config = AppConfig()
    if args.config:
        config = AppConfig.load_from_json(Path(args.config))

    if args.input_file:
        config.input_file = args.input_file
    if args.timeout is not None:
        config.timeout = args.timeout
    if args.workers is not None:
        config.workers = args.workers
    if args.export:
        config.export = [x.strip() for x in args.export.split(",")]
    if args.resume:
        config.resume = args.resume
    if args.proxy_type:
        config.proxy_type = args.proxy_type
    if args.output_dir:
        config.output_dir = args.output_dir
    if args.log_level:
        config.logging_level = args.log_level
    if args.benchmark:
        config.benchmark = args.benchmark
    if args.compact:
        config.compact = args.compact
    if args.verbose:
        config.verbose = args.verbose

    if not config.benchmark and not config.input_file:
        print("Error: Input proxy file required unless running in --benchmark mode.")
        parser.print_help()
        sys.exit(1)

    asyncio.run(run_checker(config))

if __name__ == "__main__":
    main()
