"use client";

import React from "react";
import { DashboardFrame } from "../lib/types";

interface Props {
  frame: DashboardFrame | null;
}

export default function DashboardCards({ frame }: Props) {
  const loaded = frame?.loaded || 0;
  const checked = frame?.checked || 0;
  const remaining = frame?.remaining || 0;
  const live = frame?.live || 0;
  const dead = frame?.dead || 0;
  const invalid = frame?.invalid || 0;
  const speed = frame?.speed_current || 0;
  const elapsed = frame?.elapsed_sec || 0;
  const eta = frame?.eta_sec || 0;

  const progressPct = loaded > 0 ? (checked / loaded) * 100 : 0;
  const total = live + dead + invalid || 1;
  const livePct = (live / total) * 100;
  const deadPct = (dead / total) * 100;
  const invalidPct = (invalid / total) * 100;

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Progress Panel */}
      <div className="zdc-panel p-5">
        <div className="text-[11px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-3">Scan Progress</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono-data text-3xl font-semibold text-zdc-text">{checked.toLocaleString()}</span>
          <span className="text-zdc-muted text-sm font-body">/ {loaded.toLocaleString()}</span>
        </div>
        <div className="text-[11px] font-mono-data text-zdc-muted mt-1">{remaining.toLocaleString()} remaining</div>
        <div className="mt-4 h-1 bg-zdc-void rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, var(--zdc-signal), var(--zdc-depth))`,
            }}
          />
        </div>
      </div>

      {/* Status Panel */}
      <div className="zdc-panel p-5">
        <div className="text-[11px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-3">Results</div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="font-mono-data text-2xl font-semibold text-zdc-signal">{live.toLocaleString()}</div>
            <div className="text-[10px] text-zdc-muted font-body mt-0.5">Live</div>
          </div>
          <div className="text-center">
            <div className="font-mono-data text-2xl font-semibold text-zdc-flat">{dead.toLocaleString()}</div>
            <div className="text-[10px] text-zdc-muted font-body mt-0.5">Dead</div>
          </div>
          <div className="text-center">
            <div className="font-mono-data text-2xl font-semibold text-zdc-pending">{invalid.toLocaleString()}</div>
            <div className="text-[10px] text-zdc-muted font-body mt-0.5">Invalid</div>
          </div>
        </div>
        {/* Stacked bar */}
        <div className="mt-4 h-1.5 bg-zdc-void rounded-full overflow-hidden flex">
          <div className="h-full bg-zdc-signal transition-all duration-300" style={{ width: `${livePct}%` }} />
          <div className="h-full bg-zdc-flat transition-all duration-300" style={{ width: `${deadPct}%` }} />
          <div className="h-full bg-zdc-pending transition-all duration-300" style={{ width: `${invalidPct}%` }} />
        </div>
      </div>

      {/* Speed & ETA Panel */}
      <div className="zdc-panel p-5">
        <div className="text-[11px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-3">Throughput</div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono-data text-3xl font-semibold text-zdc-text">{speed.toFixed(0)}</span>
          <span className="text-[11px] text-zdc-muted font-body">proxies/sec</span>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="text-[11px] font-mono-data text-zdc-muted">
            <span className="text-zdc-text">{fmtTime(elapsed)}</span> elapsed
          </div>
          <div className="text-[11px] font-mono-data text-zdc-muted">
            <span className="text-zdc-signal">{fmtTime(eta)}</span> eta
          </div>
        </div>
      </div>
    </div>
  );
}
