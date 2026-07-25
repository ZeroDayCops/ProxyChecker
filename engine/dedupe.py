import re
from dataclasses import dataclass
from typing import Optional, List, Tuple, Set

PROXY_REGEX = re.compile(
    r'^(?:(?P<protocol>http|https|socks4|socks5)://)?'
    r'(?:(?P<auth>(?P<user>[^:@\s]+):(?P<pass>[^:@\s]+))@)?'
    r'(?P<ip>(?:\d{1,3}\.){3}\d{1,3}|\[[0-9a-fA-F:]+\]|[a-zA-Z0-9.-]+):'
    r'(?P<port>\d{1,5})$'
)

@dataclass
class ProxyItem:
    raw: str
    ip: str
    port: int
    user: Optional[str] = None
    password: Optional[str] = None
    protocol: Optional[str] = None
    is_valid: bool = True
    is_duplicate: bool = False
    
    @property
    def key(self) -> str:
        if self.user and self.password:
            return f"{self.user}:{self.password}@{self.ip}:{self.port}"
        return f"{self.ip}:{self.port}"

    def to_url(self, default_protocol: str = "http") -> str:
        proto = self.protocol or default_protocol
        if self.user and self.password:
            return f"{proto}://{self.user}:{self.password}@{self.ip}:{self.port}"
        return f"{proto}://{self.ip}:{self.port}"

class Deduplicator:
    @staticmethod
    def parse_line(line: str) -> Optional[ProxyItem]:
        line = line.strip()
        if not line or line.startswith("#"):
            return None
            
        match = PROXY_REGEX.match(line)
        if not match:
            # Fallback simple split check if protocol is missing
            parts = line.split(":")
            if len(parts) == 2 and parts[1].isdigit():
                return ProxyItem(raw=line, ip=parts[0], port=int(parts[1]))
            elif len(parts) == 4 and parts[1].isdigit(): # ip:port:user:pass
                return ProxyItem(raw=line, ip=parts[0], port=int(parts[1]), user=parts[2], password=parts[3])
            return ProxyItem(raw=line, ip="", port=0, is_valid=False)
            
        gd = match.groupdict()
        return ProxyItem(
            raw=line,
            ip=gd["ip"],
            port=int(gd["port"]),
            user=gd.get("user"),
            password=gd.get("pass"),
            protocol=gd.get("protocol"),
            is_valid=True
        )

    @classmethod
    def process_proxies(cls, lines: List[str]) -> Tuple[List[ProxyItem], List[ProxyItem], List[ProxyItem]]:
        valid_items: List[ProxyItem] = []
        invalid_items: List[ProxyItem] = []
        duplicates: List[ProxyItem] = []
        
        seen_keys: Set[str] = set()
        seen_ips: Set[str] = set()

        for line in lines:
            item = cls.parse_line(line)
            if not item:
                continue
            if not item.is_valid:
                invalid_items.append(item)
                continue

            if item.key in seen_keys:
                item.is_duplicate = True
                duplicates.append(item)
            elif item.ip in seen_ips:
                # Same IP across different port
                item.is_duplicate = True
                duplicates.append(item)
                valid_items.append(item)
            else:
                seen_keys.add(item.key)
                seen_ips.add(item.ip)
                valid_items.append(item)

        return valid_items, invalid_items, duplicates
