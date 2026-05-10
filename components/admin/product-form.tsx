'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trash2, Plus, X } from 'lucide-react';
import { ImageUploader } from './image-uploader';

export function ProductForm({ product, categories, collections }: { product?: any; categories: any[]; collections: any[] }) {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
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
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    if (res.ok) { router.push(`/${locale}/admin/products`); router.refresh(); }
  };

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— DETAILS</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Name (EN)</label><input required className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
            <div><label className="label">Name (AR)</label><input required className="input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
            <div><label className="label">Tagline (EN)</label><input className="input" value={form.taglineEn} onChange={(e) => setForm({ ...form, taglineEn: e.target.value })} /></div>
            <div><label className="label">Tagline (AR)</label><input className="input" value={form.taglineAr} onChange={(e) => setForm({ ...form, taglineAr: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Slug</label><input required className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description (EN)</label><textarea className="input min-h-[100px]" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description (AR)</label><textarea className="input min-h-[100px]" value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} /></div>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— PRICING</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Price IQD</label><input required type="number" className="input" value={form.priceIQD} onChange={(e) => setForm({ ...form, priceIQD: +e.target.value })} /></div>
            <div><label className="label">Price USD</label><input required type="number" step="0.01" className="input" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: +e.target.value })} /></div>
            <div><label className="label">Compare IQD</label><input type="number" className="input" value={form.compareIQD} onChange={(e) => setForm({ ...form, compareIQD: e.target.value ? +e.target.value : '' })} /></div>
            <div><label className="label">Compare USD</label><input type="number" step="0.01" className="input" value={form.compareUSD} onChange={(e) => setForm({ ...form, compareUSD: e.target.value ? +e.target.value : '' })} /></div>
            <div><label className="label">Stock</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— IMAGES</h3>
          <ImageUploader onUpload={(urls) => setImages([...images, ...urls.map((url) => ({ url }))])} />
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Or paste image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
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
          <h3 className="text-xs tracking-cinematic text-muted">— VARIANTS</h3>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input className="input col-span-3" placeholder="Size" value={v.size || ''} onChange={(e) => { const c = [...variants]; c[i].size = e.target.value; setVariants(c); }} />
              <input className="input col-span-4" placeholder="Color" value={v.color || ''} onChange={(e) => { const c = [...variants]; c[i].color = e.target.value; setVariants(c); }} />
              <input className="input col-span-3" type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const c = [...variants]; c[i].stock = +e.target.value; setVariants(c); }} />
              <button type="button" className="col-span-2 btn-ghost" onClick={() => setVariants(variants.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" className="btn-ghost w-full" onClick={() => setVariants([...variants, { size: '', color: '', stock: 0 }])}><Plus className="w-4 h-4" /> Add Variant</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-6 space-y-4">
          <h3 className="text-xs tracking-cinematic text-muted">— ORGANIZE</h3>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Collection</label>
            <select className="input" value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })}>
              <option value="">—</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select>
          </div>
        </div>

        <div className="glass p-6 space-y-3">
          <h3 className="text-xs tracking-cinematic text-muted">— STATUS</h3>
          {[['active', 'Active'], ['featured', 'Featured'], ['isNew', 'New'], ['isLimited', 'Limited']].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
              {l}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <button disabled={loading} className="btn-primary w-full">{loading ? '...' : isEdit ? 'Save' : 'Create'}</button>
          {isEdit && <button type="button" onClick={del} className="btn-danger w-full"><Trash2 className="w-4 h-4" /> Delete</button>}
        </div>
      </div>
    </form>
  );
}
