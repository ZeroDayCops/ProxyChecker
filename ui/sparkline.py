from typing import List

SPARKLINE_BARS = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"]

def render_sparkline(data: List[float], width: int = 20) -> str:
    if not data:
        return " " * width
    
    samples = data[-width:]
    min_val = min(samples)
    max_val = max(samples)
    val_range = max_val - min_val

    out = []
    for v in samples:
        if val_range == 0:
            idx = 0
        else:
            idx = int(((v - min_val) / val_range) * (len(SPARKLINE_BARS) - 1))
        out.append(SPARKLINE_BARS[idx])

    result = "".join(out)
    return result.ljust(width)
