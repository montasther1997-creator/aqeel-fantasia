'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trash2, Plus, X } from 'lucide-react';
import { ImageUploader } from './image-uploader';
import { useTranslations } from 'next-intl';

export function ProductForm({ product, categories, collections }: { product?: any; categories: any[]; collections: any[] }) {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('admin.productForm');
  const isEdit = !!product;
  const [form, setForm] = useState<any>({
    slug: product?.slug || '',
    sku: product?.sku || '',
    nameAr: product?.nameAr || '',
    nameEn: product?.nameEn || '',
    taglineAr: product?.taglineAr || '',
    taglineEn: product?.taglineEn || '',
    descAr: product?.descAr || '',
    descEn: product?.descEn || '',
    priceIQD: product?.priceIQD || 0,
    priceUSD: product?.priceUSD || 0,
    compareIQD: product?.compareIQD || '',
    compareUSD: product?.compareUSD || '',
    stock: product?.stock || 0,
    categoryId: product?.categoryId || '',
    collectionId: product?.collectionId || '',
    active: product?.active ?? true,
    featured: product?.featured ?? false,
    isNew: product?.isNew ?? false,
    isLimited: product?.isLimited ?? false,
  });
  const [images, setImages] = useState<{ url: string; alt?: string }[]>(product?.images?.map((i: any) => ({ url: i.url, alt: i.alt })) || []);
  const [variants, setVariants] = useState<any[]>(product?.variants?.map((v: any) => ({ size: v.size, color: v.color, stock: v.stock })) || []);
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, images, variants }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) { router.push(`/${locale}/admin/products`); router.refresh(); }
    else alert(data.error);
  };

  const del = async () => {
    if (!confirm(t('confirmDelete'))) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    if (res.ok) { router.push(`/${locale}/admin/products`); router.refresh(); }
  };

  const statusFields: { k: string; l: string }[] = [
    { k: 'active', l: t('active') },
    { k: 'featured', l: t('featured') },
    { k: 'isNew', l: t('isNew') },
    { k: 'isLimited', l: t('isLimited') },
  ];

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— {t('details')}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">{t('nameEn')}</label><input required className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
            <div><label className="label">{t('nameAr')}</label><input required className="input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
            <div><label className="label">{t('taglineEn')}</label><input className="input" value={form.taglineEn} onChange={(e) => setForm({ ...form, taglineEn: e.target.value })} /></div>
            <div><label className="label">{t('taglineAr')}</label><input className="input" value={form.taglineAr} onChange={(e) => setForm({ ...form, taglineAr: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">{t('slug')}</label><input required className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">{t('sku')}</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">{t('descEn')}</label><textarea className="input min-h-[100px]" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">{t('descAr')}</label><textarea className="input min-h-[100px]" value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} /></div>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— {t('pricing')}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">{t('priceIQD')}</label><input required type="number" className="input" value={form.priceIQD} onChange={(e) => setForm({ ...form, priceIQD: +e.target.value })} /></div>
            <div><label className="label">{t('priceUSD')}</label><input required type="number" step="0.01" className="input" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: +e.target.value })} /></div>
            <div><label className="label">{t('compareIQD')}</label><input type="number" className="input" value={form.compareIQD} onChange={(e) => setForm({ ...form, compareIQD: e.target.value ? +e.target.value : '' })} /></div>
            <div><label className="label">{t('compareUSD')}</label><input type="number" step="0.01" className="input" value={form.compareUSD} onChange={(e) => setForm({ ...form, compareUSD: e.target.value ? +e.target.value : '' })} /></div>
            <div><label className="label">{t('stock')}</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— {t('images')}</h3>
          <ImageUploader onUpload={(urls) => setImages([...images, ...urls.map((url) => ({ url }))])} />
          <div className="flex gap-2">
            <input className="input flex-1" placeholder={t('addImageUrl')} value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
            <button type="button" className="btn-ghost" onClick={() => { if (imgUrl) { setImages([...images, { url: imgUrl }]); setImgUrl(''); } }}><Plus className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square bg-bg-secondary group">
                <img src={img.url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-bg-primary/80 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— {t('variants')}</h3>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input className="input col-span-3" placeholder={t('size')} value={v.size || ''} onChange={(e) => { const c = [...variants]; c[i].size = e.target.value; setVariants(c); }} />
              <input className="input col-span-4" placeholder={t('color')} value={v.color || ''} onChange={(e) => { const c = [...variants]; c[i].color = e.target.value; setVariants(c); }} />
              <input className="input col-span-3" type="number" placeholder={t('stock')} value={v.stock} onChange={(e) => { const c = [...variants]; c[i].stock = +e.target.value; setVariants(c); }} />
              <button type="button" className="col-span-2 btn-ghost" onClick={() => setVariants(variants.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" className="btn-ghost w-full" onClick={() => setVariants([...variants, { size: '', color: '', stock: 0 }])}><Plus className="w-4 h-4" /> {t('addVariant')}</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— {t('organize')}</h3>
          <div>
            <label className="label">{t('category')}</label>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('collection')}</label>
            <select className="input" value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })}>
              <option value="">—</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select>
          </div>
        </div>

        <div className="glass p-6 space-y-3">
          <h3 className="text-xs tracking-cinematic text-muted">— {t('status')}</h3>
          {statusFields.map((f) => (
            <label key={f.k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.checked })} />
              {f.l}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <button disabled={loading} className="btn-primary w-full">{loading ? '...' : isEdit ? t('save') : t('create')}</button>
          {isEdit && <button type="button" onClick={del} className="btn-danger w-full"><Trash2 className="w-4 h-4" /> {t('delete')}</button>}
        </div>
      </div>
    </form>
  );
}
