import importlib
import inspect
from pathlib import Path
from typing import List
from plugins.base import PluginBase

class PluginManager:
    def __init__(self, plugin_dir: Path = Path("plugins")):
        self.plugin_dir = plugin_dir
        self.plugins: List[PluginBase] = []
        self.load_plugins()

    def load_plugins(self):
        if not self.plugin_dir.exists():
            return
        for file in self.plugin_dir.glob("*.py"):
            if file.name.startswith("_") or file.name == "base.py":
                continue
            module_name = f"plugins.{file.stem}"
            try:
                mod = importlib.import_module(module_name)
                for attr_name in dir(mod):
                    attr = getattr(mod, attr_name)
                    if inspect.isclass(attr) and issubclass(attr, PluginBase) and attr is not PluginBase:
                        self.plugins.append(attr())
            except Exception as e:
                print(f"Failed to load plugin {file.name}: {e}")

    def run_pre_check(self, proxies):
        for p in self.plugins:
            proxies = p.pre_check(proxies)
        return proxies

    def run_post_check(self, results):
        for p in self.plugins:
            results = p.post_check(results)
        return results
