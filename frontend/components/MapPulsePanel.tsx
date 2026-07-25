"use client";

import React, { useEffect, useRef } from "react";
import { ProxyRow } from "../lib/types";

// Simplified equirectangular world map coordinates for major countries
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "US": [0.22, 0.38], "United States": [0.22, 0.38],
  "CA": [0.20, 0.28], "Canada": [0.20, 0.28],
  "BR": [0.35, 0.62], "Brazil": [0.35, 0.62],
  "GB": [0.48, 0.30], "United Kingdom": [0.48, 0.30],
  "DE": [0.52, 0.32], "Germany": [0.52, 0.32],
  "FR": [0.50, 0.34], "France": [0.50, 0.34],
  "NL": [0.51, 0.31], "Netherlands": [0.51, 0.31],
  "RU": [0.65, 0.28], "Russia": [0.65, 0.28],
  "CN": [0.76, 0.38], "China": [0.76, 0.38],
  "JP": [0.84, 0.38], "Japan": [0.84, 0.38],
  "KR": [0.81, 0.38], "South Korea": [0.81, 0.38],
  "IN": [0.70, 0.45], "India": [0.70, 0.45],
  "AU": [0.82, 0.70], "Australia": [0.82, 0.70],
  "SG": [0.75, 0.52], "Singapore": [0.75, 0.52],
  "ZA": [0.54, 0.72], "South Africa": [0.54, 0.72],
  "MX": [0.17, 0.43], "Mexico": [0.17, 0.43],
  "AR": [0.30, 0.75], "Argentina": [0.30, 0.75],
  "ID": [0.77, 0.54], "Indonesia": [0.77, 0.54],
  "TR": [0.57, 0.37], "Turkey": [0.57, 0.37],
  "PL": [0.53, 0.31], "Poland": [0.53, 0.31],
  "UA": [0.56, 0.32], "Ukraine": [0.56, 0.32],
  "IT": [0.52, 0.36], "Italy": [0.52, 0.36],
  "ES": [0.48, 0.37], "Spain": [0.48, 0.37],
  "SE": [0.52, 0.26], "Sweden": [0.52, 0.26],
  "TH": [0.75, 0.48], "Thailand": [0.75, 0.48],
  "VN": [0.76, 0.48], "Vietnam": [0.76, 0.48],
  "EG": [0.56, 0.42], "Egypt": [0.56, 0.42],
  "NG": [0.50, 0.50], "Nigeria": [0.50, 0.50],
  "KE": [0.57, 0.52], "Kenya": [0.57, 0.52],
  "Unknown": [0.50, 0.50],
};

interface Ping {
  x: number;
  y: number;
  color: string;
  id: number;
  fading: boolean;
}

interface Props {
  recentRows: ProxyRow[];
}

let pingCounter = 0;

export default function MapPulsePanel({ recentRows }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pingsRef = useRef<Ping[]>([]);
  const dotsRef = useRef<Ping[]>([]);
  const prevLenRef = useRef(0);

  // Add new pings when recentRows grows
  useEffect(() => {
    if (recentRows.length <= prevLenRef.current) return;
    const newRows = recentRows.slice(prevLenRef.current);
    prevLenRef.current = recentRows.length;

    for (const row of newRows) {
      const country = row.country || "Unknown";
      const coords = COUNTRY_COORDS[country] || COUNTRY_COORDS["Unknown"];
      // Add jitter so dots don't stack
      const jx = coords[0] + (Math.random() - 0.5) * 0.04;
      const jy = coords[1] + (Math.random() - 0.5) * 0.04;
      const color = row.status === "live" ? "#29E8C8" : row.status === "dead" ? "#FF5C7A" : "#F5A623";
      const ping: Ping = { x: jx, y: jy, color, id: pingCounter++, fading: false };
      pingsRef.current.push(ping);
      dotsRef.current.push({ ...ping, fading: false });
      // Keep dots manageable
      if (dotsRef.current.length > 500) dotsRef.current.shift();
    }
  }, [recentRows]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw map outline (simplified continent shapes as filled polygons)
      ctx.fillStyle = "rgba(18, 21, 29, 0.8)";
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = "rgba(122, 129, 148, 0.08)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const x = (w / 8) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const y = (h / 5) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw persistent dots
      for (const dot of dotsRef.current) {
        ctx.beginPath();
        ctx.arc(dot.x * w, dot.y * h, 2, 0, Math.PI * 2);
        ctx.fillStyle = dot.color + "60";
        ctx.fill();
      }

      // Draw active pings (expanding rings)
      const now = Date.now();
      pingsRef.current = pingsRef.current.filter((p) => {
        const age = now - (p.id * 0.01);
        if (age > 1200) return false;
        const scale = 1 + (age / 1200) * 2;
        const opacity = 1 - age / 1200;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 4 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + Math.round(opacity * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Center dot
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="zdc-panel p-4 mb-6">
      <div className="text-[11px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-2">Geographic Distribution</div>
      <div className="relative w-full" style={{ aspectRatio: "2.2 / 1" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-lg"
          style={{ imageRendering: "auto" }}
        />
      </div>
      <div className="flex gap-4 mt-3 text-[10px] font-mono-data">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zdc-signal" />
          <span className="text-zdc-muted">Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zdc-flat" />
          <span className="text-zdc-muted">Dead</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zdc-pending" />
          <span className="text-zdc-muted">Invalid</span>
        </div>
      </div>
    </div>
  );
}
