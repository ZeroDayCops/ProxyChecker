"use client";

import React, { useState } from "react";
import { uploadProxies } from "../lib/api";
import { UploadResponse } from "../lib/types";

interface Props {
  onUploadSuccess: (uploadData: UploadResponse) => void;
}

export default function FileDropzone({ onUploadSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<UploadResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const res = await uploadProxies(files);
      setPreview(res);
      onUploadSuccess(res);
    } catch {
      alert("Failed to upload proxy file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zdc-panel p-5">
      <div className="text-[11px] font-body font-medium text-zdc-muted uppercase tracking-widest mb-3">Proxy Source</div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-zdc p-8 cursor-pointer transition-all duration-150 ${
          dragOver
            ? "border-zdc-signal bg-zdc-signal/5 scale-[1.01]"
            : "border-zdc-depth/30 hover:border-zdc-depth/60 bg-zdc-void/40"
        }`}
      >
        <svg className="w-8 h-8 mb-2 text-zdc-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm font-body text-zdc-muted">Drop proxy lists here, or browse</span>
        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
        />
      </label>

      {loading && <div className="text-[11px] text-zdc-signal font-mono-data mt-3">Parsing & deduplicating proxy list...</div>}

      {preview && !loading && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="font-mono-data text-[11px] bg-zdc-void px-2.5 py-1 rounded-md border border-zdc-muted/10 text-zdc-text">
            {preview.loaded_count.toLocaleString()} <span className="text-zdc-muted">loaded</span>
          </span>
          <span className="font-mono-data text-[11px] bg-zdc-void px-2.5 py-1 rounded-md border border-zdc-signal/20 text-zdc-signal">
            {preview.valid_count.toLocaleString()} <span className="text-zdc-muted">valid</span>
          </span>
          <span className="font-mono-data text-[11px] bg-zdc-void px-2.5 py-1 rounded-md border border-zdc-pending/20 text-zdc-pending">
            {preview.duplicate_count.toLocaleString()} <span className="text-zdc-muted">dupes removed</span>
          </span>
          <span className="font-mono-data text-[11px] bg-zdc-void px-2.5 py-1 rounded-md border border-zdc-flat/20 text-zdc-flat">
            {preview.invalid_count.toLocaleString()} <span className="text-zdc-muted">invalid</span>
          </span>
        </div>
      )}

      {!preview && !loading && (
        <div className="text-[11px] font-body text-zdc-muted/60 mt-3 text-center">Drop a proxy list to get started</div>
      )}
    </div>
  );
}
