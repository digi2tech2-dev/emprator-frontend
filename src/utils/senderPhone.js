// Mirrors the backend's shared phone normalizer without guessing a country code.
export const normalizeSenderPhone = (value) => {
  if (typeof value !== 'string' || value.length > 64) return '';
  const raw = value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .trim();
  if (!/^[0-9+ ()-]+$/.test(raw)) return '';
  const normalized = raw.replace(/[ ()-]/g, '');
  return /^\+?\d{7,15}$/.test(normalized) && (!raw.includes('+') || raw.startsWith('+'))
    ? normalized
    : '';
};

export const validateSenderPhone = (value) => {
  if (!String(value || '').trim()) return 'يرجى إدخال رقم الهاتف الذي حوّلت منه';
  return normalizeSenderPhone(value) ? '' : 'أدخل رقم هاتف صالحًا من 7 إلى 15 رقمًا، ويمكن أن يبدأ برمز الدولة';
};
