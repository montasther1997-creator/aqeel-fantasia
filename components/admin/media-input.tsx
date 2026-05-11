'use client';
import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/toast';

type Mode = 'upload' | 'url';
type Kind = 'image' | 'video';

export function MediaInput({
  value, onChange, kind = 'image', label, hint,
}: {
  value: string;
  onChange: (v: string) => void;
  kind?: Kind;
  label?: string;
  hint?: string;
}) {
  const t = useTranslations('admin.mediaInput');
  const tc = useTranslations('admin.common');
  const [mode, setMode] = useState<Mode>('url');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const accept = kind === 'video'
    ? 'video/mp4,video/webm'
    : 'image/jpeg,image/png,image/webp,image/gif';

  const sizeNote = kind === 'video' ? t('videoSize') : t('imageSize');

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('files', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast('error', data.error === 'file-too-large' ? t('tooLarge') : tc('updateFailed'));
        return;
      }
      onChange(data.urls[0]);
      toast('success', t('uploaded'));
    } catch {
      toast('error', tc('updateFailed'));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] tracking-cinematic text-muted block">{label}</label>}

      <div className="border border-line bg-bg-secondary/30">
        <div className="flex border-b border-line">
          <TabButton active={mode === 'upload'} onClick={() => setMode('upload')} icon={<Upload className="w-3 h-3" />} label={t('upload')} />
          <TabButton active={mode === 'url'} onClick={() => setMode('url')} icon={<LinkIcon className="w-3 h-3" />} label={t('url')} />
        </div>

        <div className="p-3 space-y-2">
          {mode === 'upload' ? (
            <div>
              <input
                ref={fileInput}
                type="file"
                accept={accept}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="w-full border border-dashed border-line hover:border-electric transition-colors py-6 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-electric" />
                    <span className="text-xs text-muted">{t('uploading')}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted" />
                    <span className="text-xs text-muted">{t('chooseFile')}</span>
                    <span className="text-[10px] text-muted opacity-60">{sizeNote}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <input
              type="url"
              className="input"
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={kind === 'video' ? t('urlPlaceholderVideo') : t('urlPlaceholderImage')}
            />
          )}
        </div>
      </div>

      {value && (
        <div className="relative inline-block">
          {kind === 'image' ? (
            <img src={value} alt="" className="max-h-32 max-w-full border border-line bg-bg-secondary object-contain" />
          ) : (
            <video src={value} className="max-h-32 max-w-full border border-line bg-bg-secondary" controls muted />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-6 h-6 bg-blood text-white rounded-full flex items-center justify-center hover:bg-blood/80"
            aria-label={tc('clear')}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {hint && <p className="text-[10px] text-muted opacity-70">{hint}</p>}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 text-xs tracking-cinematic inline-flex items-center justify-center gap-2 transition-colors ${
        active ? 'bg-bg-elevated text-frost border-b-2 border-electric -mb-px' : 'text-muted hover:text-frost'
      }`}
    >
      {icon} {label}
    </button>
  );
}
