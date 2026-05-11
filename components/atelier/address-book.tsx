'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { IRAQ_GOVERNORATES_AR, IRAQ_GOVERNORATES_EN } from '@/lib/constants';
import { Icon } from './icons';
import { toast } from '@/components/ui/toast';

const empty = { recipient: '', country: 'Iraq', governorate: '', city: '', area: '', street: '', details: '', phone: '', isDefault: false };

export function AddressBook({ initial }: { initial: any[] }) {
  const router = useRouter();
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const govs = isAr ? IRAQ_GOVERNORATES_AR : IRAQ_GOVERNORATES_EN;
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(initial.length === 0);

  const save = async () => {
    if (!form.recipient || !form.phone || !form.governorate || !form.city) {
      toast('error', isAr ? 'أكمل الحقول المطلوبة' : 'Please complete required fields');
      return;
    }
    setBusy(true);
    const url = editing ? `/api/account/addresses/${editing.id}` : '/api/account/addresses';
    const method = editing ? 'PATCH' : 'POST';
    const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false);
    if (r.ok) {
      toast('success', isAr ? 'حفظ' : 'Saved');
      setForm(empty); setEditing(null); setShowForm(false);
      router.refresh();
    } else {
      toast('error', isAr ? 'حدث خطأ' : 'Failed');
    }
  };

  const del = async (id: string) => {
    if (!confirm(isAr ? 'حذف العنوان؟' : 'Delete address?')) return;
    await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isDefault: true }) });
    router.refresh();
  };

  const startEdit = (a: any) => {
    setEditing(a);
    setForm({
      recipient: a.recipient, country: a.country, governorate: a.governorate, city: a.city,
      area: a.area || '', street: a.street || '', details: a.details || '', phone: a.phone, isDefault: a.isDefault,
    });
    setShowForm(true);
  };

  const cancel = () => { setEditing(null); setForm(empty); setShowForm(false); };

  return (
    <div>
      {/* List */}
      <div className="space-y-px bg-border mb-10">
        {initial.length === 0 && (
          <div className="bg-bg p-8 text-center">
            <p className="serif italic text-fg-secondary text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
              {isAr ? 'لم تُضِف عنواناً بعد.' : 'No addresses yet.'}
            </p>
          </div>
        )}
        {initial.map((a) => (
          <div key={a.id} className="bg-bg p-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="serif text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{a.recipient}</p>
                {a.isDefault && <span className="text-[9px] tracking-[0.2em] uppercase text-accent border border-accent/40 px-2 py-0.5" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>★ {isAr ? 'افتراضي' : 'DEFAULT'}</span>}
              </div>
              <p className="text-sm text-fg-secondary">{a.governorate} · {a.city} {a.area && `· ${a.area}`}</p>
              {a.street && <p className="text-xs text-fg-tertiary mt-1">{a.street}</p>}
              <p className="text-xs text-fg-tertiary mt-1 font-mono num" dir="ltr">{a.phone}</p>
            </div>
            <div className="flex gap-1">
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="w-8 h-8 grid place-items-center text-fg-tertiary hover:text-accent transition-colors" title="Set default">
                  <Icon name="check" size={14} />
                </button>
              )}
              <button onClick={() => startEdit(a)} className="w-8 h-8 grid place-items-center text-fg-tertiary hover:text-fg transition-colors" title="Edit">
                <Icon name="settings" size={14} />
              </button>
              <button onClick={() => del(a.id)} className="w-8 h-8 grid place-items-center text-fg-tertiary hover:text-burgundy transition-colors" title="Delete">
                <Icon name="close" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit form */}
      {showForm ? (
        <div className="border border-border p-6 md:p-8 bg-bg-elevated/30">
          <div className={`text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-6 ${isAr ? 'text-right' : 'text-left'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {editing ? (isAr ? '✎ تعديل العنوان' : '✎ EDIT ADDRESS') : (isAr ? '+ عنوان جديد' : '+ NEW ADDRESS')}
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label={isAr ? 'اسم المستلم' : 'Recipient'} value={form.recipient} onChange={(v: string) => setForm({ ...form, recipient: v })} required />
            <Field label={isAr ? 'الهاتف' : 'Phone'} value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} dir="ltr" placeholder="+964..." required />
            <div>
              <div className="field-label">{isAr ? 'المحافظة' : 'Governorate'}</div>
              <select required className="field" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                <option value="">—</option>
                {govs.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <Field label={isAr ? 'المدينة' : 'City'} value={form.city} onChange={(v: string) => setForm({ ...form, city: v })} required />
            <Field label={isAr ? 'المنطقة' : 'Area'} value={form.area} onChange={(v: string) => setForm({ ...form, area: v })} />
            <Field label={isAr ? 'الشارع' : 'Street'} value={form.street} onChange={(v: string) => setForm({ ...form, street: v })} />
            <div className="sm:col-span-2">
              <Field label={isAr ? 'تفاصيل' : 'Details'} value={form.details} onChange={(v: string) => setForm({ ...form, details: v })} />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              {isAr ? 'تعيين كعنوان افتراضي' : 'Set as default address'}
            </label>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={save} disabled={busy} className="btn btn-champagne flex-1">{busy ? '…' : (isAr ? 'حفظ' : 'Save')}</button>
            <button onClick={cancel} className="btn btn-secondary">{isAr ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn btn-secondary w-full">
          + {isAr ? 'إضافة عنوان جديد' : 'Add new address'}
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required, dir, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; dir?: string; placeholder?: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} dir={dir as any} placeholder={placeholder} className="field" />
    </div>
  );
}
