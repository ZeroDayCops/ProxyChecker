"use client";

import React, { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import ConfigPanel from "../components/ConfigPanel";
import DashboardCards from "../components/DashboardCards";
import MapPulsePanel from "../components/MapPulsePanel";
import LiveGraphs from "../components/LiveGraphs";
import ResultsTable from "../components/ResultsTable";
import ProxyDetailDrawer from "../components/ProxyDetailDrawer";
import ControlBar from "../components/ControlBar";
import ExportMenu from "../components/ExportMenu";
import SessionSummaryModal from "../components/SessionSummaryModal";

import { useProxyCheckerSocket } from "../hooks/useProxyCheckerSocket";
import { createSession } from "../lib/api";
import { UploadResponse, SessionConfig, ProxyRow } from "../lib/types";

export default function ProxyCheckerToolPage() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ProxyRow | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  const { frame, summary } = useProxyCheckerSocket(sessionId);

  const handleStartSession = async (config: SessionConfig) => {
    if (!uploadData) return alert("Please upload a proxy file first!");
    try {
      const res = await createSession(uploadData.file_id, config);
      setSessionId(res.session_id);
    } catch {
      alert("Failed to start scan session");
    }
  };

  return (
    <main className="min-h-screen bg-zdc-void text-zdc-text p-4 md:p-8 font-body">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zdc-border">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zdc-signal animate-pulse shadow-[0_0_8px_#29E8C8]"></span>
            <h1 className="text-xl font-display font-bold text-zdc-text tracking-tight uppercase">
              ZeroDayCops <span className="text-zdc-muted font-normal">|</span> Proxy Checker
            </h1>
          </div>
          <p className="text-[11px] font-mono-data text-zdc-muted mt-1">
            Realtime high-concurrency proxy liveness, latency & anonymity validator
          </p>
        </div>
        <ExportMenu rows={frame?.recent_rows || []} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 space-y-6">
          <FileDropzone onUploadSuccess={setUploadData} />
          <ConfigPanel onStart={handleStartSession} disabled={!uploadData} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DashboardCards frame={frame} />
          <MapPulsePanel recentRows={frame?.recent_rows || []} />
          {!compact && <LiveGraphs graphs={frame?.graphs} />}
        </div>
      </div>

      <ControlBar
        sessionId={sessionId}
        compact={compact}
        onToggleCompact={() => setCompact(!compact)}
      />

      <ResultsTable rows={frame?.recent_rows || []} onSelectRow={setSelectedRow} />

      <ProxyDetailDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
      {showSummary && (
        <SessionSummaryModal summary={summary} onClose={() => setShowSummary(false)} />
      )}
    </main>
  );
}
