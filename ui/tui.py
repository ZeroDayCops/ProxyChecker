from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.layout import Layout
from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn
from ui.sparkline import render_sparkline
from engine.core import EngineScheduler

class DashboardTUI:
    def __init__(self, scheduler: EngineScheduler, compact: bool = False, verbose: bool = False):
        self.scheduler = scheduler
        self.compact = compact
        self.verbose = verbose
        self.log_tail = []

    def add_log(self, text: str):
        self.log_tail.append(text)
        if len(self.log_tail) > 10:
            self.log_tail.pop(0)

    def render_dashboard(self) -> Panel:
        table = Table.grid(expand=True)
        table.add_column(justify="left")
        table.add_column(justify="right")

        cps_spark = render_sparkline(self.scheduler.checks_per_sec_history)
        succ_spark = render_sparkline(self.scheduler.success_rate_history)
        lat_spark = render_sparkline(self.scheduler.avg_latency_history)
        cpu_spark = render_sparkline(self.scheduler.cpu_usage_history)
        mem_spark = render_sparkline(self.scheduler.memory_usage_history)
        net_spark = render_sparkline(self.scheduler.network_throughput_history)

        curr_cps = self.scheduler.checks_per_sec_history[-1] if self.scheduler.checks_per_sec_history else 0
        curr_succ = self.scheduler.success_rate_history[-1] if self.scheduler.success_rate_history else 0
        curr_lat = self.scheduler.avg_latency_history[-1] if self.scheduler.avg_latency_history else 0
        curr_cpu = self.scheduler.cpu_usage_history[-1] if self.scheduler.cpu_usage_history else 0
        curr_mem = self.scheduler.memory_usage_history[-1] if self.scheduler.memory_usage_history else 0
        curr_net = self.scheduler.network_throughput_history[-1] if self.scheduler.network_throughput_history else 0

        grid = Table(show_header=True, header_style="bold magenta", expand=True)
        grid.add_column("Metric", style="cyan")
        grid.add_column("Value", style="bold green")
        grid.add_column("60s Rolling Sparkline", style="yellow")

        grid.add_row("Checks/sec", f"{curr_cps:.1f}", cps_spark)
        grid.add_row("Success rate %", f"{curr_succ:.1f}%", succ_spark)
        grid.add_row("Average latency", f"{curr_lat:.0f} ms", lat_spark)
        grid.add_row("CPU usage", f"{curr_cpu:.1f}%", cpu_spark)
        grid.add_row("Memory usage", f"{curr_mem:.1f}%", mem_spark)
        grid.add_row("Network throughput", f"{curr_net:.1f} KB/s", net_spark)

        return Panel(grid, title="[bold white]ZeroDayCops ProxyChecker Live Metrics[/bold white]", border_style="cyan")

    def render_logs(self) -> Panel:
        text = Text("\n".join(self.log_tail))
        return Panel(text, title="[bold white]Live Proxy Tail[/bold white]", border_style="dim")
