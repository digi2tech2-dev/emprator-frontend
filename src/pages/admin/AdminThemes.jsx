import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, CreditCard, Palette, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react';
import apiClient from '../../services/client';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/ui/Toast';

const isRealProvider = (import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase() === 'real';

const copy = {
  ar: {
    title: 'إدارة الثيمات', subtitle: 'متابعة مشتركي Theme Pro وسجل التخصيص والتحكم في إتاحة الثيم لكل مستخدم.',
    subscribers: 'مشتركو Theme Pro النشطون', failed: 'المدفوعات غير المكتملة أو المعكوسة',
    search: 'ابحث عن مستخدم بالاسم أو البريد الإلكتروني', searchButton: 'بحث', user: 'المستخدم',
    status: 'الحالة', expires: 'ينتهي في', noSubscribers: 'لا يوجد مشتركون نشطون في هذه الصفحة.',
    noFailed: 'لا توجد مدفوعات فاشلة أو معكوسة في هذه الصفحة.', noUsers: 'لا توجد نتائج لهذا البحث.',
    selectUser: 'اختر مستخدمًا من البحث أو قائمة المشتركين لعرض تفاصيله.',
    account: 'تفاصيل المستخدم', version: 'نسخة الثيم المنشورة', lastPublish: 'آخر نشر',
    availability: 'إتاحة التخصيص', enabled: 'متاح', disabled: 'معطّل',
    reason: 'سبب القرار (مطلوب)', disable: 'تعطيل التخصيص', enable: 'إتاحة التخصيص',
    subscriptions: 'الاشتراكات', payments: 'المدفوعات', history: 'سجل الثيم', audit: 'قرارات الإدارة',
    noRecords: 'لا توجد سجلات.', loading: 'جارٍ التحميل...', refresh: 'تحديث',
    previous: 'السابق', next: 'التالي', paymentNotice: 'الدفع الإلكتروني لـ Theme Pro غير مفعّل حاليًا.',
    mockNotice: 'تتطلب هذه الصفحة الاتصال بالباك إند الحقيقي لعرض بيانات الثيمات.',
    searchMinimum: 'اكتب حرفين على الأقل للبحث.', reasonRequired: 'اكتب سبب القرار قبل الحفظ.',
    saved: 'تم حفظ قرار الإتاحة وتسجيله.', loadError: 'تعذّر تحميل بيانات الثيمات. حاول مرة أخرى.',
    saveError: 'تعذّر حفظ القرار. حاول مرة أخرى.', active: 'نشط', expired: 'منتهي',
    revoked: 'ملغى', pending: 'معلّق', verified: 'موثّق', failedStatus: 'فاشل',
    refunded: 'مسترد', chargeback: 'اعتراض دفع', cancelled: 'ملغى',
    sourceVersion: 'نسخة', actor: 'بواسطة', planPrice: '24.99 USDT / 3 أشهر تقويمية',
  },
  en: {
    title: 'Theme Management', subtitle: 'Review Theme Pro subscribers, customization history, and user availability.',
    subscribers: 'Active Theme Pro subscribers', failed: 'Failed or reversed payments',
    search: 'Search users by name or email', searchButton: 'Search', user: 'User',
    status: 'Status', expires: 'Expires', noSubscribers: 'No active subscribers on this page.',
    noFailed: 'No failed or reversed payments on this page.', noUsers: 'No users match this search.',
    selectUser: 'Choose a user from search or subscribers to view details.',
    account: 'User details', version: 'Published theme version', lastPublish: 'Last published',
    availability: 'Customization availability', enabled: 'Enabled', disabled: 'Disabled',
    reason: 'Reason for change (required)', disable: 'Disable customization', enable: 'Enable customization',
    subscriptions: 'Subscriptions', payments: 'Payments', history: 'Theme history', audit: 'Admin decisions',
    noRecords: 'No records.', loading: 'Loading...', refresh: 'Refresh',
    previous: 'Previous', next: 'Next', paymentNotice: 'Theme Pro online checkout is currently unavailable.',
    mockNotice: 'Connect to the real backend to view theme management data.',
    searchMinimum: 'Enter at least two characters to search.', reasonRequired: 'Enter a reason before saving.',
    saved: 'Availability updated and audited.', loadError: 'Could not load theme data. Try again.',
    saveError: 'Could not save this change. Try again.', active: 'Active', expired: 'Expired',
    revoked: 'Revoked', pending: 'Pending', verified: 'Verified', failedStatus: 'Failed',
    refunded: 'Refunded', chargeback: 'Chargeback', cancelled: 'Cancelled',
    sourceVersion: 'Version', actor: 'By', planPrice: '24.99 USDT / 3 calendar months',
  },
};

const panelClass = 'rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.8)] bg-[color:rgb(var(--color-card-rgb)/0.92)] p-4 shadow-[var(--shadow-subtle)] sm:p-5';
const fieldClass = 'min-w-0 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.9)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50';

const Panel = ({ title, icon: Icon, children, action }) => (
  <section className={panelClass}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-[var(--color-text)]"><Icon className="h-5 w-5 text-[var(--color-primary)]" />{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const AdminThemes = () => {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const t = copy[language] || copy.ar;
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [failedPayments, setFailedPayments] = useState([]);
  const [failedPage, setFailedPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [detail, setDetail] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo',
    }).format(date);
  };
  const statusLabel = (value) => {
    const key = String(value || '').toLowerCase();
    return ({ active: t.active, expired: t.expired, revoked: t.revoked, pending: t.pending,
      verified: t.verified, failed: t.failedStatus, refunded: t.refunded,
      chargeback: t.chargeback, cancelled: t.cancelled })[key] || value || '—';
  };

  const loadOverview = useCallback(async () => {
    if (!isRealProvider) return;
    setLoading(true);
    try {
      const [subscriberData, failedData] = await Promise.all([
        apiClient.themeAdmin.listSubscribers(subscriberPage),
        apiClient.themeAdmin.listFailedPayments(failedPage),
      ]);
      setSubscribers(subscriberData?.items || []);
      setFailedPayments(failedData?.items || []);
      setError('');
    } catch {
      setError(copy[language]?.loadError || copy.ar.loadError);
    } finally {
      setLoading(false);
    }
  }, [subscriberPage, failedPage, language]);

  const loadDetail = useCallback(async (userId) => {
    if (!userId || !isRealProvider) return;
    setDetailLoading(true);
    try {
      const result = await apiClient.themeAdmin.getUser(userId);
      setDetail(result);
      setError('');
    } catch {
      setDetail(null);
      setError(copy[language]?.loadError || copy.ar.loadError);
    } finally {
      setDetailLoading(false);
    }
  }, [language]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (selectedUserId) loadDetail(selectedUserId); }, [selectedUserId, loadDetail]);

  const submitSearch = async (event) => {
    event.preventDefault();
    if (search.trim().length < 2) { addToast(t.searchMinimum, 'warning'); return; }
    setLoading(true);
    try {
      const result = await apiClient.themeAdmin.searchUsers(search.trim());
      setSearchResults(result?.items || []);
      setHasSearched(true);
      setError('');
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const setAvailability = async () => {
    if (!detail?.user?._id) return;
    if (!reason.trim()) { addToast(t.reasonRequired, 'warning'); return; }
    setSaving(true);
    try {
      await apiClient.themeAdmin.setAvailability(detail.user._id, !detail.settings?.customizationDisabled, reason.trim());
      setReason('');
      await loadDetail(detail.user._id);
      addToast(t.saved, 'success');
    } catch {
      addToast(t.saveError, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isRealProvider) return <div className={`${panelClass} text-[var(--color-text)]`}>{t.mockNotice}</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:px-6 sm:py-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-[var(--color-text)]"><Palette className="h-7 w-7 text-[var(--color-primary)]" />{t.title}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>
        </div>
        <button type="button" className={buttonClass} onClick={loadOverview} disabled={loading}><RefreshCw className="h-4 w-4" />{t.refresh}</button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`${panelClass} flex items-center gap-3`}><ShieldCheck className="h-8 w-8 text-emerald-500" /><div><p className="font-bold text-[var(--color-text)]">Theme Pro</p><p className="text-sm text-[var(--color-text-secondary)]">{t.planPrice}</p></div></div>
        <div className={`${panelClass} flex items-center gap-3`}><AlertCircle className="h-8 w-8 text-amber-500" /><p className="text-sm text-[var(--color-text-secondary)]">{t.paymentNotice}</p></div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={t.subscribers} icon={Users} action={<span className="text-xs text-[var(--color-text-secondary)]">{loading ? t.loading : `${subscribers.length}`}</span>}>
          <div className="space-y-2">
            {subscribers.map((item) => <button key={item._id} type="button" onClick={() => setSelectedUserId(item.userId?._id || item.userId)} className={`${buttonClass} w-full justify-between text-start`}>
              <span className="min-w-0 truncate"><strong>{item.userId?.name || item.userId?.email || item.userId}</strong><span className="block truncate text-xs font-normal text-[var(--color-text-secondary)]">{item.userId?.email}</span></span>
              <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{formatDate(item.expiresAt)}</span>
            </button>)}
            {!loading && subscribers.length === 0 && <p className="py-5 text-center text-sm text-[var(--color-text-secondary)]">{t.noSubscribers}</p>}
          </div>
          <div className="mt-4 flex justify-end gap-2"><button type="button" className={buttonClass} disabled={subscriberPage === 1 || loading} onClick={() => setSubscriberPage((page) => page - 1)}>{t.previous}</button><button type="button" className={buttonClass} disabled={subscribers.length < 20 || loading} onClick={() => setSubscriberPage((page) => page + 1)}>{t.next}</button></div>
        </Panel>

        <Panel title={t.search} icon={Search}>
          <form onSubmit={submitSearch} className="flex gap-2"><input className={`${fieldClass} w-full`} value={search} onChange={(event) => setSearch(event.target.value)} aria-label={t.search} placeholder={t.search} /><button type="submit" className={buttonClass} disabled={loading}>{t.searchButton}</button></form>
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => <button key={user._id} type="button" className={`${buttonClass} w-full justify-start text-start`} onClick={() => setSelectedUserId(user._id)}><span className="min-w-0 truncate"><strong>{user.name}</strong><span className="block truncate text-xs font-normal text-[var(--color-text-secondary)]" dir="ltr">{user.email}</span></span></button>)}
            {hasSearched && searchResults.length === 0 && <p className="py-5 text-center text-sm text-[var(--color-text-secondary)]">{t.noUsers}</p>}
          </div>
        </Panel>
      </div>

      <Panel title={t.account} icon={Palette}>
        {detailLoading ? <p className="text-sm text-[var(--color-text-secondary)]">{t.loading}</p> : detail ? <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-[var(--color-text)]">{detail.user.name}</p><p className="text-sm text-[var(--color-text-secondary)]" dir="ltr">{detail.user.email}</p></div><span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">{detail.settings?.customizationDisabled ? t.disabled : t.enabled}</span></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[var(--color-surface)] p-3"><p className="text-xs text-[var(--color-text-secondary)]">{t.version}</p><p className="font-bold text-[var(--color-text)]">{detail.settings?.version ?? 0}</p></div><div className="rounded-xl bg-[var(--color-surface)] p-3"><p className="text-xs text-[var(--color-text-secondary)]">{t.lastPublish}</p><p className="font-bold text-[var(--color-text)]">{formatDate(detail.settings?.lastSuccessfulPublishAt)}</p></div></div>
          <div className="flex flex-wrap gap-2"><input className={`${fieldClass} min-w-48 flex-1`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder={t.reason} aria-label={t.reason} /><button type="button" className={buttonClass} onClick={setAvailability} disabled={saving}>{saving ? t.loading : detail.settings?.customizationDisabled ? t.enable : t.disable}</button></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RecordList title={t.subscriptions} items={detail.subscriptions} empty={t.noRecords} render={(item) => <><strong>{item.planId}</strong> · {statusLabel(item.effectiveStatus || item.status)}<span className="block text-xs text-[var(--color-text-secondary)]">{formatDate(item.startsAt)} — {formatDate(item.expiresAt)}</span></>} />
            <RecordList title={t.payments} items={detail.payments} empty={t.noRecords} render={(item) => <><strong>{statusLabel(item.status)}</strong> · {item.currency} {(item.amountMinor / 100).toFixed(2)}<span className="block truncate text-xs text-[var(--color-text-secondary)]" dir="ltr">{item.providerReference}</span></>} />
            <RecordList title={t.history} items={detail.history} empty={t.noRecords} render={(item) => <><strong>{t.sourceVersion} {item.version}</strong> · {item.configuration?.presetId || '—'}<span className="block text-xs text-[var(--color-text-secondary)]">{formatDate(item.publishedAt)}</span></>} />
            <RecordList title={t.audit} items={detail.audit} empty={t.noRecords} render={(item) => <><strong>{item.action === 'DISABLE' ? t.disable : t.enable}</strong> · {item.reason}<span className="block text-xs text-[var(--color-text-secondary)]">{formatDate(item.createdAt)}</span></>} />
          </div>
        </div> : <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">{t.selectUser}</p>}
      </Panel>

      <Panel title={t.failed} icon={CreditCard}>
        <div className="space-y-2">{failedPayments.map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)]"><span><strong>{statusLabel(item.status)}</strong> · {item.provider}<span className="block text-xs text-[var(--color-text-secondary)]" dir="ltr">{item.providerReference}</span></span><span>{formatDate(item.createdAt)}</span></div>)}
          {!loading && failedPayments.length === 0 && <p className="py-5 text-center text-sm text-[var(--color-text-secondary)]">{t.noFailed}</p>}</div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" className={buttonClass} disabled={failedPage === 1 || loading} onClick={() => setFailedPage((page) => page - 1)}>{t.previous}</button><button type="button" className={buttonClass} disabled={failedPayments.length < 20 || loading} onClick={() => setFailedPage((page) => page + 1)}>{t.next}</button></div>
      </Panel>
    </div>
  );
};

const RecordList = ({ title, items = [], empty, render }) => <section className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.7)] p-3"><h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]"><CalendarClock className="h-4 w-4 text-[var(--color-primary)]" />{title}</h3><div className="max-h-56 space-y-2 overflow-auto">{items.length ? items.map((item) => <div key={item._id} className="rounded-lg bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]">{render(item)}</div>) : <p className="py-3 text-center text-xs text-[var(--color-text-secondary)]">{empty}</p>}</div></section>;

export default AdminThemes;
