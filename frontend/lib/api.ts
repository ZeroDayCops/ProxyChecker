import { SessionConfig, UploadResponse, SessionSummary } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function uploadProxies(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload proxy file(s)");
  return res.json();
}

export async function createSession(fileId: string, config: SessionConfig): Promise<{ session_id: string }> {
  const res = await fetch(`${API_BASE}/api/sessions?file_id=${fileId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to start session");
  return res.json();
}

export async function controlSession(sessionId: string, action: "pause" | "resume" | "stop") {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/${action}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to ${action} session`);
  return res.json();
}

export async function getSessionHistory(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE}/api/sessions`);
  if (!res.ok) return [];
  return res.json();
}
