from typing import List
from engine.dedupe import ProxyItem
from engine.checker import CheckResult

class PluginBase:
    name: str = "BasePlugin"
    version: str = "1.0.0"

    def pre_check(self, proxies: List[ProxyItem]) -> List[ProxyItem]:
        """Hook called before proxies enter the checking pipeline."""
        return proxies

    def post_check(self, results: List[CheckResult]) -> List[CheckResult]:
        """Hook called after checking finishes."""
        return results
