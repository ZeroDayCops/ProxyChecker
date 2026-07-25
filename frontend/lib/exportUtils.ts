import { ProxyRow } from "./types";

export type ExportFormat = "txt" | "csv" | "json";

export function exportProxiesClientSide(rows: ProxyRow[], format: ExportFormat) {
  if (!rows || rows.length === 0) return;

  let content = "";
  let mimeType = "text/plain";
  let extension = "txt";

  if (format === "txt") {
    content = rows.map((r) => `${r.ip}:${r.port}`).join("\n");
    mimeType = "text/plain";
    extension = "txt";
  } else if (format === "csv") {
    const headers = ["ip", "port", "protocol", "status", "latency_ms", "country", "asn"];
    const body = rows.map((r) =>
      [r.ip, r.port, r.protocol, r.status, r.latency_ms, r.country || "", r.asn || ""].join(",")
    );
    content = [headers.join(","), ...body].join("\n");
    mimeType = "text/csv";
    extension = "csv";
  } else if (format === "json") {
    content = JSON.stringify(rows, null, 2);
    mimeType = "application/json";
    extension = "json";
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `proxy_results_${Date.now()}.${extension}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
