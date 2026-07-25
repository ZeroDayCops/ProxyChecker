import ipaddress
import aiohttp
from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class GeoInfo:
    ip: str
    ip_version: str = "IPv4"
    country: str = "Unknown"
    city: str = "Unknown"
    asn_isp: str = "Unknown"
    protocol: str = "http"

class ProxyEnricher:
    def __init__(self):
        self.cache: Dict[str, GeoInfo] = {}

    def detect_ip_version(self, ip_str: str) -> str:
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            return f"IPv{ip_obj.version}"
        except ValueError:
            return "IPv4"

    async def enrich(self, ip: str, protocol: str = "http") -> GeoInfo:
        if ip in self.cache:
            return self.cache[ip]

        ip_ver = self.detect_ip_version(ip)
        geo = GeoInfo(ip=ip, ip_version=ip_ver, protocol=protocol)

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"http://ip-api.com/json/{ip}?fields=status,country,city,isp,as", timeout=aiohttp.ClientTimeout(total=3.0)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if data.get("status") == "success":
                            geo.country = data.get("country", "Unknown")
                            geo.city = data.get("city", "Unknown")
                            geo.asn_isp = f"{data.get('as', '')} {data.get('isp', '')}".strip() or "Unknown"
        except Exception:
            pass

        self.cache[ip] = geo
        return geo
