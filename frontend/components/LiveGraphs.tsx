"use client";

import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { DashboardGraphData } from "../lib/types";

interface Props {
  graphs?: DashboardGraphData;
}

export default function LiveGraphs({ graphs }: Props) {
  const transform = (arr: number[] = []) => arr.map((v, i) => ({ idx: i, val: v }));

  const scanMetrics = [
    { title: "Checks / sec", data: transform(graphs?.cps), color: "#29E8C8", gradId: "cps" },
    { title: "Success rate %", data: transform(graphs?.success_rate), color: "#29E8C8", gradId: "succ" },
    { title: "Avg latency (ms)", data: transform(graphs?.latency_ms), color: "#29E8C8", gradId: "lat" },
  ];

  const systemMetrics = [
    { title: "CPU %", data: transform(graphs?.cpu_pct), color: "#6C5CE7", gradId: "cpu" },
    { title: "Memory %", data: transform(graphs?.mem_pct), color: "#6C5CE7", gradId: "mem" },
    { title: "Net KB/s", data: transform(graphs?.net_kbps), color: "#6C5CE7", gradId: "net" },
  ];

  const renderSparkline = (item: typeof scanMetrics[0]) => (
    <div key={item.gradId} className="zdc-panel p-3">
      <div className="text-[10px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-2">{item.title}</div>
      <div className="flex items-end justify-between mb-1">
        <span className="font-mono-data text-lg font-semibold" style={{ color: item.color }}>
          {item.data.length > 0 ? item.data[item.data.length - 1].val.toFixed(1) : "—"}
        </span>
      </div>
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={item.data}>
            <defs>
              <linearGradient id={item.gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={item.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke={item.color}
              fill={`url(#${item.gradId})`}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scanMetrics.map(renderSparkline)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {systemMetrics.map(renderSparkline)}
      </div>
    </div>
  );
}
