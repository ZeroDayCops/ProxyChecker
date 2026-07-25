from engine.dedupe import Deduplicator

def test_deduplication():
    lines = [
        "192.168.1.1:8080",
        "192.168.1.1:8080",
        "192.168.1.1:9090",
        "invalid_proxy_string",
        "user:pass@10.0.0.1:3128"
    ]
    valid, invalid, duplicates = Deduplicator.process_proxies(lines)
    assert len(valid) == 3
    assert len(invalid) == 1
    assert len(duplicates) == 2
