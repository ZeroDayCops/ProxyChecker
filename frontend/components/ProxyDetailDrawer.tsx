"use client";

import React from "react";
import { ProxyRow } from "../lib/types";

interface Props {
  row: ProxyRow | null;
  onClose: () => void;
}

export default function ProxyDetailDrawer({ row, onClose }: Props) {
  if (!row) return null;

  return (
    <div className="fixed inset-0 bg-zdc-void/70 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-zdc-panel border-l border-zdc-border h-full p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-zdc-border pb-4 mb-6">
            <div>
              <div className="text-[10px] font-body text-zdc-muted uppercase tracking-widest">Proxy Detail</div>
              <h2 className="font-mono-data text-lg font-bold text-zdc-signal mt-0.5">{row.ip}:{row.port}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-zdc-muted hover:text-zdc-text p-1 rounded-md transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-zdc-void p-3.5 rounded-zdc-sm border border-zdc-border">
              <span className="text-[10px] font-body text-zdc-muted uppercase tracking-wider block mb-1">Status & Protocol</span>
              <div className="flex items-center justify-between">
                <span className={`font-mono-data text-xs uppercase px-2 py-0.5 rounded-md ${
                  row.status === "live" ? "bg-zdc-signal/15 text-zdc-signal" : row.status === "dead" ? "bg-zdc-flat/15 text-zdc-flat" : "bg-zdc-pending/15 text-zdc-pending"
                }`}>
                  {row.status}
                </span>
                <span className="font-mono-data text-xs text-zdc-text uppercase">{row.protocol}</span>
              </div>
            </div>

            <div className="bg-zdc-void p-3.5 rounded-zdc-sm border border-zdc-border space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zdc-muted font-body">Latency</span>
                <span className="font-mono-data text-zdc-text font-semibold">{row.latency_ms} ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zdc-muted font-body">Country</span>
                <span className="font-mono-data text-zdc-text">{row.country || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zdc-muted font-body">ASN</span>
                <span className="font-mono-data text-zdc-text">{row.asn || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-zdc-void border border-zdc-border text-zdc-muted hover:text-zdc-text rounded-zdc-sm font-body text-xs transition mt-6"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
