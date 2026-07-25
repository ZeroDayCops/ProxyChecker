"use client";

import React from "react";
import { SessionSummary } from "../lib/types";

interface Props {
  summary: SessionSummary | null;
  onClose: () => void;
}

export default function SessionSummaryModal({ summary, onClose }: Props) {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-zdc-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="zdc-panel max-w-lg w-full p-6 border border-zdc-signal/40 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zdc-border pb-4 mb-5">
          <div>
            <div className="text-[10px] font-body text-zdc-signal uppercase tracking-widest">Scan Complete</div>
            <h3 className="font-display text-lg font-bold text-zdc-text mt-0.5">Session Summary</h3>
          </div>
          <span className="font-mono-data text-[10px] bg-zdc-void px-2 py-1 rounded text-zdc-muted border border-zdc-border">
            ID: {summary.session_id.slice(0, 8)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5 text-center">
          <div className="bg-zdc-void p-3 rounded-zdc-sm border border-zdc-signal/20">
            <div className="font-mono-data text-xl font-bold text-zdc-signal">{summary.live}</div>
            <div className="text-[10px] text-zdc-muted font-body mt-1 uppercase">Live</div>
          </div>
          <div className="bg-zdc-void p-3 rounded-zdc-sm border border-zdc-flat/20">
            <div className="font-mono-data text-xl font-bold text-zdc-flat">{summary.dead}</div>
            <div className="text-[10px] text-zdc-muted font-body mt-1 uppercase">Dead</div>
          </div>
          <div className="bg-zdc-void p-3 rounded-zdc-sm border border-zdc-pending/20">
            <div className="font-mono-data text-xl font-bold text-zdc-pending">{summary.invalid}</div>
            <div className="text-[10px] text-zdc-muted font-body mt-1 uppercase">Invalid</div>
          </div>
        </div>

        <div className="bg-zdc-void p-4 rounded-zdc-sm border border-zdc-border space-y-2 mb-6 font-mono-data text-xs">
          <div className="flex justify-between text-zdc-muted">
            <span>Total Checked:</span>
            <span className="text-zdc-text font-semibold">{summary.checked} / {summary.loaded}</span>
          </div>
          <div className="flex justify-between text-zdc-muted">
            <span>Duration:</span>
            <span className="text-zdc-text font-semibold">{summary.duration}</span>
          </div>
          <div className="flex justify-between text-zdc-muted">
            <span>Avg Speed:</span>
            <span className="text-zdc-signal font-semibold">{(summary.average_speed_cps || 0).toFixed(1)} cps</span>
          </div>
          <div className="flex justify-between text-zdc-muted">
            <span>Latency Range:</span>
            <span className="text-zdc-text font-semibold">{summary.fastest_ms || 0}ms – {summary.slowest_ms || 0}ms (avg {summary.avg_latency_ms || 0}ms)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-zdc-signal/15 text-zdc-signal border border-zdc-signal/40 hover:bg-zdc-signal/25 rounded-zdc-sm font-display font-semibold text-xs transition"
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}
