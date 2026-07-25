export interface SessionConfig {
  timeout: number;
  workers?: number;
  retry_count: number;
  proxy_type: string;
  output_dir: string;
}

export interface UploadResponse {
  file_id: string;
  loaded_count: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
}

export interface ProxyRow {
  ip: string;
  port: number;
  protocol: string;
  status: "live" | "dead" | "invalid";
  latency_ms: number;
  country?: string;
  asn?: string;
}

export interface DashboardGraphData {
  cps: number[];
  success_rate: number[];
  latency_ms: number[];
  cpu_pct: number[];
  mem_pct: number[];
  net_kbps: number[];
}

export interface DashboardFrame {
  type: string;
  session_id: string;
  loaded: number;
  checked: number;
  remaining: number;
  live: number;
  dead: number;
  invalid: number;
  speed_current: number;
  speed_avg: number;
  elapsed_sec: number;
  eta_sec: number;
  graphs: DashboardGraphData;
  recent_rows: ProxyRow[];
}

export interface SessionSummary {
  session_id: string;
  loaded: number;
  checked: number;
  live: number;
  dead: number;
  invalid: number;
  avg_latency_ms: number;
  fastest_ms: number;
  slowest_ms: number;
  duration: string;
  average_speed_cps: number;
}
