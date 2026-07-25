"use client";

import React, { useState } from "react";
import { SessionConfig } from "../lib/types";

interface Props {
  onStart: (config: SessionConfig) => void;
  disabled: boolean;
}

const PROXY_TYPES = ["all", "http", "https", "socks4", "socks5"] as const;

export default function ConfigPanel({ onStart, disabled }: Props) {
  const [timeout, setTimeoutVal] = useState(5.0);
  const [workers, setWorkers] = useState<number>(100);
  const [autoWorkers, setAutoWorkers] = useState(true);
  const [retryCount, setRetryCount] = useState(2);
  const [proxyType, setProxyType] = useState<string>("all");

  const handleStart = () => {
    onStart({
      timeout,
      workers: autoWorkers ? undefined : workers,
      retry_count: retryCount,
      proxy_type: proxyType,
      output_dir: "./results",
    });
  };

  return (
    <div className="zdc-panel p-5">
      <div className="text-[11px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-4">Configuration</div>

      {/* Proxy Type — Segmented Pill Group */}
      <div className="mb-4">
        <div className="text-[10px] font-body text-zdc-muted uppercase tracking-wider mb-1.5">Protocol</div>
        <div className="flex bg-zdc-void rounded-zdc-sm p-0.5 border border-zdc-muted/10">
          {PROXY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setProxyType(t)}
              className={`flex-1 px-2 py-1.5 text-[11px] font-body font-medium rounded-md capitalize transition-all duration-120 ${
                proxyType === t
                  ? "bg-zdc-signal/15 text-zdc-signal"
                  : "text-zdc-muted hover:text-zdc-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Concurrency — Auto/Manual segmented + slider */}
      <div className="mb-4">
        <div className="text-[10px] font-body text-zdc-muted uppercase tracking-wider mb-1.5">Concurrency</div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zdc-void rounded-zdc-sm p-0.5 border border-zdc-muted/10">
            <button
              onClick={() => setAutoWorkers(true)}
              className={`px-3 py-1 text-[11px] font-body font-medium rounded-md transition-all duration-120 ${
                autoWorkers ? "bg-zdc-depth/20 text-zdc-depth" : "text-zdc-muted hover:text-zdc-text"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setAutoWorkers(false)}
              className={`px-3 py-1 text-[11px] font-body font-medium rounded-md transition-all duration-120 ${
                !autoWorkers ? "bg-zdc-depth/20 text-zdc-depth" : "text-zdc-muted hover:text-zdc-text"
              }`}
            >
              Manual
            </button>
          </div>
          {!autoWorkers && (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={workers}
                onChange={(e) => setWorkers(parseInt(e.target.value))}
                className="flex-1 accent-[#6C5CE7] h-1"
              />
              <span className="font-mono-data text-xs text-zdc-text w-12 text-right">{workers}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeout & Retries */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <div className="text-[10px] font-body text-zdc-muted uppercase tracking-wider mb-1.5">Timeout (sec)</div>
          <input
            type="number"
            value={timeout}
            onChange={(e) => setTimeoutVal(parseFloat(e.target.value))}
            className="w-full bg-zdc-void border border-zdc-muted/15 rounded-zdc-sm px-3 py-1.5 text-sm font-mono-data text-zdc-text focus:border-zdc-signal/40 transition"
          />
        </div>
        <div>
          <div className="text-[10px] font-body text-zdc-muted uppercase tracking-wider mb-1.5">Retries</div>
          <input
            type="number"
            value={retryCount}
            onChange={(e) => setRetryCount(parseInt(e.target.value))}
            className="w-full bg-zdc-void border border-zdc-muted/15 rounded-zdc-sm px-3 py-1.5 text-sm font-mono-data text-zdc-text focus:border-zdc-signal/40 transition"
          />
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={disabled}
        className="w-full py-2.5 rounded-zdc-sm font-display font-semibold text-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed bg-zdc-signal/15 text-zdc-signal border border-zdc-signal/30 hover:bg-zdc-signal/25 hover:border-zdc-signal/50"
      >
        Start scan
      </button>
    </div>
  );
}
