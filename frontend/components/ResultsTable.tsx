"use client";

import React, { useState } from "react";
import { ProxyRow } from "../lib/types";

interface Props {
  rows: ProxyRow[];
  onSelectRow: (row: ProxyRow) => void;
}

type FilterType = "all" | "live" | "dead" | "invalid";

export default function ResultsTable({ rows, onSelectRow }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filteredRows = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.ip.includes(search) && !r.port.toString().includes(search)) return false;
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live" },
    { key: "dead", label: "Dead" },
    { key: "invalid", label: "Invalid" },
  ];

  const statusDotColor = (s: string) =>
    s === "live" ? "bg-zdc-signal" : s === "dead" ? "bg-zdc-flat" : "bg-zdc-pending";

  const statusBorderColor = (s: string) =>
    s === "live" ? "border-l-zdc-signal" : s === "dead" ? "border-l-zdc-flat" : "border-l-zdc-pending";

  return (
    <div className="zdc-panel p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-display font-semibold text-zdc-text">Proxy Stream</h3>
          <span className="font-mono-data text-xs text-zdc-muted">{filteredRows.length} results</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search IP / Port..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zdc-void border border-zdc-muted/20 rounded-zdc-sm px-3 py-1.5 text-xs text-zdc-text font-mono-data placeholder:text-zdc-muted/50 focus:border-zdc-signal/40 transition"
          />
          {/* Segmented filter control */}
          <div className="flex bg-zdc-void rounded-zdc-sm p-0.5 border border-zdc-muted/10">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-[11px] font-body font-medium rounded-md transition-all duration-120 ${
                  filter === f.key
                    ? "bg-zdc-signal/15 text-zdc-signal"
                    : "text-zdc-muted hover:text-zdc-text"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zdc-muted/10">
              <th className="p-2.5 text-[10px] font-body font-medium text-zdc-muted uppercase tracking-widest">IP Address</th>
              <th className="p-2.5 text-[10px] font-body font-medium text-zdc-muted uppercase tracking-widest">Port</th>
              <th className="p-2.5 text-[10px] font-body font-medium text-zdc-muted uppercase tracking-widest">Protocol</th>
              <th className="p-2.5 text-[10px] font-body font-medium text-zdc-muted uppercase tracking-widest sticky left-0 bg-zdc-panel">Status</th>
              <th className="p-2.5 text-[10px] font-body font-medium text-zdc-muted uppercase tracking-widest">Latency</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onSelectRow(row)}
                className={`border-l-2 border-l-transparent hover:border-l-2 hover:${statusBorderColor(row.status)} hover:bg-zdc-panel/80 cursor-pointer transition-all duration-120`}
              >
                <td className="p-2.5 font-mono-data text-zdc-text">{row.ip}</td>
                <td className="p-2.5 font-mono-data text-zdc-muted">{row.port}</td>
                <td className="p-2.5 font-mono-data text-zdc-muted uppercase text-[10px]">{row.protocol}</td>
                <td className="p-2.5 sticky left-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor(row.status)}`} />
                    <span className="font-mono-data text-zdc-muted text-[10px] uppercase">{row.status}</span>
                  </div>
                </td>
                <td className="p-2.5 font-mono-data text-zdc-muted">{row.latency_ms}<span className="text-zdc-muted/50 ml-0.5">ms</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
