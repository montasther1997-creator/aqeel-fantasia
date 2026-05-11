'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from './image-uploader';
import { Trash2, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function MediaLibrary({ initial }: { initial: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.media');
  const tc = useTranslations('admin.common');
  const [items, setItems] = useState(initial);
  const [copied, setCopied] = useState<string | null>(null);

  const onUpload = () => router.refresh();

  const del = async (id: string) => {
    if (!confirm(tc('confirmDelete'))) return;
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    setItems(items.filter((x) => x.id !== id));
  };

  const copy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <ImageUploader onUpload={onUpload} />
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((m) => (
          <div key={m.id} className="relative group glass">
            <div className="aspect-square bg-bg-secondary overflow-hidden">
              {m.type === 'video' ? (
                <video src={m.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={m.url} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="absolute inset-0 bg-bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button onClick={() => copy(m.url, m.id)} className="text-frost flex items-center gap-1 text-xs">
                {copied === m.id ? <><Check className="w-3 h-3 text-electric" /> {t('copied')}</> : <><Copy className="w-3 h-3" /> {t('copyUrl')}</>}
              </button>
              <button onClick={() => del(m.id)} className="text-blood text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> {t('delete')}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted col-span-6 text-sm">{t('empty')}</p>}
      </div>
    </div>
  );
}
