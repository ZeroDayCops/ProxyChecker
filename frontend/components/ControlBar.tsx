"use client";

import React from "react";
import { controlSession } from "../lib/api";

interface Props {
  sessionId: string | null;
  compact: boolean;
  onToggleCompact: () => void;
}

export default function ControlBar({ sessionId, compact, onToggleCompact }: Props) {
  const handleAction = async (action: "pause" | "resume" | "stop") => {
    if (!sessionId) return;
    try {
      await controlSession(sessionId, action);
    } catch {
      /* silently handled */
    }
  };

  const actions = [
    { key: "pause" as const, label: "Pause", shortcut: "P" },
    { key: "resume" as const, label: "Resume", shortcut: "R" },
  ];

  return (
    <div className="zdc-panel p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex">
        {/* Connected button group */}
        <div className="flex rounded-zdc-sm overflow-hidden border border-zdc-muted/15">
          {actions.map((a, i) => (
            <button
              key={a.key}
              onClick={() => handleAction(a.key)}
              disabled={!sessionId}
              className={`px-4 py-1.5 text-[11px] font-body font-medium disabled:opacity-30 transition-all duration-120 hover:bg-zdc-signal/10 hover:text-zdc-signal text-zdc-muted ${
                i > 0 ? "border-l border-zdc-muted/15" : ""
              }`}
            >
              <span className="font-mono-data text-[10px] text-zdc-muted/50 mr-1">[{a.shortcut}]</span>
              {a.label}
            </button>
          ))}
          <button
            onClick={() => handleAction("stop")}
            disabled={!sessionId}
            className="px-4 py-1.5 text-[11px] font-body font-medium disabled:opacity-30 transition-all duration-120 text-zdc-muted hover:bg-zdc-flat/10 hover:text-zdc-flat border-l border-zdc-muted/15"
          >
            <span className="font-mono-data text-[10px] text-zdc-muted/50 mr-1">[Q]</span>
            Stop scan
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleCompact}
          className="flex rounded-zdc-sm overflow-hidden border border-zdc-muted/15"
        >
          <span
            className={`px-3 py-1.5 text-[11px] font-body transition-all duration-120 ${
              compact ? "bg-zdc-depth/15 text-zdc-depth" : "text-zdc-muted"
            }`}
          >
            Compact
          </span>
          <span
            className={`px-3 py-1.5 text-[11px] font-body border-l border-zdc-muted/15 transition-all duration-120 ${
              !compact ? "bg-zdc-depth/15 text-zdc-depth" : "text-zdc-muted"
            }`}
          >
            Verbose
          </span>
        </button>
      </div>
    </div>
  );
}
