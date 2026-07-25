"use client";

import React, { useState } from "react";
import { ProxyRow } from "../lib/types";
import { exportProxiesClientSide, ExportFormat } from "../lib/exportUtils";

interface Props {
  rows: ProxyRow[];
}

export default function ExportMenu({ rows }: Props) {
  const [open, setOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    exportProxiesClientSide(rows, format);
    setOpen(false);
  };

  const formats: { key: ExportFormat; label: string; desc: string }[] = [
    { key: "txt", label: "Text (.txt)", desc: "IP:Port plain list" },
    { key: "csv", label: "CSV (.csv)", desc: "Full schema dump" },
    { key: "json", label: "JSON (.json)", desc: "Structured telemetry" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={rows.length === 0}
        className="px-4 py-2 bg-zdc-panel border border-zdc-signal/30 text-zdc-signal rounded-zdc-sm font-display font-medium text-xs hover:bg-zdc-signal/10 transition-all disabled:opacity-30 flex items-center gap-2"
      >
        <span>Export Data ({rows.length})</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-zdc-panel border border-zdc-border rounded-zdc-sm shadow-xl z-50 p-1.5 backdrop-blur-md">
          {formats.map((f) => (
            <button
              key={f.key}
              onClick={() => handleExport(f.key)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-zdc-signal/15 transition flex flex-col gap-0.5 group"
            >
              <span className="font-mono-data text-xs text-zdc-text group-hover:text-zdc-signal font-semibold">
                {f.label}
              </span>
              <span className="font-body text-[10px] text-zdc-muted">{f.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
