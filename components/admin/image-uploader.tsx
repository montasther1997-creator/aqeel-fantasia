'use client';
import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export function ImageUploader({ onUpload }: { onUpload: (urls: string[]) => void }) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    try {
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (data.ok && data.urls) onUpload(data.urls);
      else alert(data.error || 'upload-failed');
    } finally { setBusy(false); }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed cursor-pointer p-8 text-center transition-all ${drag ? 'border-electric bg-electric/5' : 'border-line hover:border-frost/30'}`}
    >
      <input ref={ref} type="file" multiple accept="image/*,video/*" hidden
        onChange={(e) => handle(e.target.files)} />
      {busy ? (
        <div className="flex flex-col items-center gap-2 text-muted">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-xs tracking-cinematic">UPLOADING...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted">
          <Upload className="w-6 h-6" />
          <p className="text-xs tracking-cinematic">DROP FILES OR CLICK</p>
        </div>
      )}
    </div>
  );
}
