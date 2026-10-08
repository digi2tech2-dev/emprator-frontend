import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import Modal from './Modal';
import logoImg from '../../assets/logo.webp';
import { buildWhatsAppLink, buildPhoneLink, getSupportContacts } from '../../utils/whatsapp';

/* ─── contact card colours ─── */
const CONTACT_STYLES = {
  owner: {
    gradient: 'from-amber-500 to-yellow-400',
    glow: 'shadow-[0_8px_24px_-10px_rgb(245_158_11/0.75)]',
    badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    icon: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950',
    label: 'text-amber-300',
    ring: 'ring-amber-400/40',
  },
  support: {
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-[0_8px_24px_-10px_rgb(16_185_129/0.75)]',
    badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
    icon: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950',
    label: 'text-emerald-300',
    ring: 'ring-emerald-400/40',
  },
};

const FALLBACK_STYLE = {
  gradient: 'from-violet-500 to-purple-400',
  glow: 'shadow-[0_8px_24px_-10px_rgb(139_92_246/0.75)]',
  badge: 'bg-violet-400/20 text-violet-300 border-violet-400/30',
  icon: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white',
  label: 'text-violet-300',
  ring: 'ring-violet-400/40',
};

const getContactStyle = (contact) => CONTACT_STYLES[contact.id] || FALLBACK_STYLE;

const WhatsAppContactChooser = ({ isOpen, onClose, message = '', isArabic = true }) => {
  const contacts = getSupportContacts();

  const openContact = (contact) => {
    if (contact.type === 'phone') {
      window.location.href = buildPhoneLink(contact.number);
    } else {
      window.open(buildWhatsAppLink({ number: contact.number, message }), '_blank', 'noopener,noreferrer');
    }
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      title={isArabic ? 'تواصل معنا' : 'Contact Us'}
    >
      <div dir={isArabic ? 'rtl' : 'ltr'} className="space-y-3">

        {/* ── Hero banner with logo bg ── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d0b14]">
          {/* Logo watermark */}
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-[0.07] blur-[1px] scale-110"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--color-primary-rgb)/0.28),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0b14]/80" />

          {/* Content */}
          <div className="relative z-10 px-5 py-6 text-center">
            {/* Logo visible */}
            <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_32px_rgb(var(--color-primary-rgb)/0.3)]">
              <img src={logoImg} alt="EMBRATOR" className="h-full w-full object-contain p-1" />
            </div>

            <h3 className="text-base font-black text-white">
              {isArabic ? 'خدمة عملاء الإمبراطور' : 'EMBRATOR Customer Service'}
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-white/55">
              {isArabic ? 'نحن هنا لمساعدتك على مدار الساعة' : "We're here for you around the clock"}
            </p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-[9.5px] font-bold text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgb(52_211_153/0.9)]" />
                {isArabic ? 'متاح الآن' : 'Available now'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-[9.5px] font-bold text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgb(251_191_36/0.9)]" />
                {isArabic ? 'رد سريع' : 'Fast reply'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Section label ── */}
        <p className="px-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
          {isArabic ? 'اختر جهة التواصل' : 'Select a contact'}
        </p>

        {/* ── Contact cards ── */}
        <div className="grid gap-2.5">
          {contacts.map((contact) => {
            const style = getContactStyle(contact);
            const isWA = contact.type === 'whatsapp';
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => openContact(contact)}
                aria-label={`${isArabic ? contact.nameAr : contact.nameEn} — ${contact.number}`}
                className={`group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-white/8 bg-[color:rgb(var(--color-surface-rgb)/0.55)] p-3.5 text-start ring-0 transition duration-200 hover:-translate-y-0.5 hover:ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${style.ring}`}
              >
                {/* Glow streak on hover */}
                <div className={`absolute inset-y-0 start-0 w-0.5 rounded-full bg-gradient-to-b ${style.gradient} opacity-60`} />

                {/* Icon */}
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg font-black shadow-lg transition-transform duration-200 group-hover:scale-105 ${style.icon} ${style.glow}`}>
                  {isWA
                    ? <MessageCircle className="h-5 w-5" />
                    : <Phone className="h-5 w-5" />
                  }
                </span>

                {/* Text */}
                <span className="min-w-0 flex-1">
                  <strong className="block text-[13px] font-black text-[var(--color-text)]">
                    {isArabic ? contact.nameAr : contact.nameEn}
                  </strong>
                  <span dir="ltr" className={`mt-0.5 block text-xs font-bold tracking-wide ${style.label}`}>
                    {contact.number}
                  </span>
                </span>

                {/* Type badge */}
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${style.badge}`}>
                  {isWA ? 'WhatsApp' : 'Call'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-[10px] font-semibold text-[var(--color-text-secondary)]/60">
          {isArabic
            ? 'بالضغط على أي بطاقة ستُفتح المحادثة مباشرةً'
            : 'Tap any card to open the conversation directly'}
        </p>
      </div>
    </Modal>
  );
};

export default WhatsAppContactChooser;
