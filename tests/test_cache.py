from pathlib import Path
from engine.cache import CacheManager

def test_cache_ttl(tmp_path):
    cache_file = tmp_path / "test_cache.json"
    cache = CacheManager(cache_file=cache_file, ttl_seconds=1)
    
    cache.set("1.1.1.1:80", {"is_live": True})
    assert cache.get("1.1.1.1:80") == {"is_live": True}
