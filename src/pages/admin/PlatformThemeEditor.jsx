import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock3, CreditCard, History, ImagePlus, LockKeyhole, Palette, RotateCcw, Save, Sparkles } from 'lucide-react';
import apiClient from '../../services/client';
import useMediaStore from '../../store/useMediaStore';
import CategoryCard from '../../components/home/CategoryCard';
import { createStorefrontCategories } from '../../utils/storefront';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/ui/Toast';
import { platformThemeStyles } from '../../theme/platformTheme';
import { resolveImageUrl } from '../../utils/imageUrl';
import './PlatformThemeEditor.css';

const liveApi = (import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase() === 'real';
const card = 'rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.8)] bg-[color:rgb(var(--color-card-rgb)/0.94)] p-4 shadow-[var(--shadow-subtle)] sm:p-5';
const input = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50';
const colorKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'mutedText', 'border'];
const neonSections = ['purchase', 'hero', 'categories', 'bestSellers'];
const sampleNeon = () => ({ purchase: { enabled: false, color: '#22D3EE', speed: 5 },
  hero: { enabled: false, color: '#A855F7', speed: 5 },
  categories: { enabled: false, color: '#34D399', speed: 5 },
  bestSellers: { enabled: false, color: '#F59E0B', speed: 5 }, categoryCards: {} });
const freeFonts = { arabic: ['Cairo', 'Tajawal'], english: ['Inter', 'Arial'] };
const fonts = { arabic: [...freeFonts.arabic, 'Noto Sans Arabic', 'Almarai', 'Changa', 'IBM Plex Sans Arabic', 'Rubik'],
  english: [...freeFonts.english, 'Roboto', 'Poppins', 'Montserrat', 'Outfit', 'Plus Jakarta Sans'] };
const sampleColors = {
  light: { primary: '#2563EB', secondary: '#475569', accent: '#F59E0B', background: '#FFFFFF', surface: '#F8FAFC', text: '#0F172A', mutedText: '#475569', border: '#CBD5E1' },
  dark: { primary: '#60A5FA', secondary: '#A78BFA', accent: '#FBBF24', background: '#0F172A', surface: '#1E293B', text: '#F8FAFC', mutedText: '#CBD5E1', border: '#475569' },
};
const samplePart = (mode) => ({ presetId: 'classic', colors: { ...sampleColors[mode] },
  typography: { arabicFont: 'Cairo', englishFont: 'Inter', baseSize: 16, headingWeight: 700 },
  buttons: { radius: 8, style: 'solid' }, cards: { radius: 12, shadow: 'subtle' }, navigation: { style: 'standard' }, neon: sampleNeon() });
const DEFAULT_MARQUEE_AR = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿قُلْ إِنَّ رَبِّي يَبْسُطُ الرِّزْقَ لِمَنْ يَشَاءُ مِنْ عِبَادِهِ وَيَقْدِرُ لَهُ وَمَا أَنْفَقْتُمْ مِنْ شَيْءٍ فَهُوَ يُخْلِفُهُ وَهُوَ خَيْرُ الرَّازِقِينَ﴾ صَدَقَ اللَّهُ الْعَظِيمُ';
const sampleTheme = { schemaVersion: 2, modes: { light: samplePart('light'), dark: samplePart('dark') },
  brand: { logoPath: null, logoWidth: 144, slides: [null, null, null, null], marqueeTextArabic: DEFAULT_MARQUEE_AR } };
const previewPresetPalettes = {
  "classic": {
    "light": [
      "#2563EB",
      "#475569",
      "#F59E0B",
      "#FFFFFF",
      "#F8FAFC",
      "#0F172A",
      "#475569",
      "#CBD5E1"
    ],
    "dark": [
      "#60A5FA",
      "#A78BFA",
      "#FBBF24",
      "#0F172A",
      "#1E293B",
      "#F8FAFC",
      "#CBD5E1",
      "#475569"
    ]
  },
  "midnight": {
    "light": [
      "#1D4ED8",
      "#334155",
      "#D97706",
      "#EFF6FF",
      "#FFFFFF",
      "#0F172A",
      "#475569",
      "#CBD5E1"
    ],
    "dark": [
      "#60A5FA",
      "#A78BFA",
      "#FBBF24",
      "#0B1023",
      "#17213A",
      "#F8FAFC",
      "#CBD5E1",
      "#475569"
    ]
  },
  "warm": {
    "light": [
      "#B45309",
      "#92400E",
      "#047857",
      "#FFFBEB",
      "#FFFFFF",
      "#292524",
      "#57534E",
      "#D6D3D1"
    ],
    "dark": [
      "#FBBF24",
      "#FDBA74",
      "#6EE7B7",
      "#292014",
      "#3C2D1D",
      "#FFF7ED",
      "#D6D3D1",
      "#786550"
    ]
  },
  "ocean": {
    "light": [
      "#0369A1",
      "#0E7490",
      "#0F766E",
      "#F0F9FF",
      "#FFFFFF",
      "#082F49",
      "#475569",
      "#BAE6FD"
    ],
    "dark": [
      "#38BDF8",
      "#67E8F9",
      "#5EEAD4",
      "#082F49",
      "#164E63",
      "#F0F9FF",
      "#BAE6FD",
      "#0E7490"
    ]
  },
  "forest": {
    "light": [
      "#15803D",
      "#166534",
      "#B45309",
      "#F0FDF4",
      "#FFFFFF",
      "#14532D",
      "#3F6212",
      "#BBF7D0"
    ],
    "dark": [
      "#4ADE80",
      "#86EFAC",
      "#FACC15",
      "#0F2418",
      "#193D27",
      "#F0FDF4",
      "#BBF7D0",
      "#3F6212"
    ]
  },
  "royal": {
    "light": [
      "#6D28D9",
      "#7C3AED",
      "#C026D3",
      "#FAF5FF",
      "#FFFFFF",
      "#2E1065",
      "#6B21A8",
      "#DDD6FE"
    ],
    "dark": [
      "#C4B5FD",
      "#A78BFA",
      "#F0ABFC",
      "#1E1239",
      "#322258",
      "#FAF5FF",
      "#DDD6FE",
      "#6D28D9"
    ]
  },
  "sunset": {
    "light": [
      "#C2410C",
      "#BE123C",
      "#B45309",
      "#FFF7ED",
      "#FFFFFF",
      "#431407",
      "#7C2D12",
      "#FED7AA"
    ],
    "dark": [
      "#FB923C",
      "#FDA4AF",
      "#FCD34D",
      "#2A1411",
      "#43201A",
      "#FFF7ED",
      "#FED7AA",
      "#9A3412"
    ]
  },
  "graphite": {
    "light": [
      "#334155",
      "#475569",
      "#0E7490",
      "#F8FAFC",
      "#FFFFFF",
      "#0F172A",
      "#475569",
      "#CBD5E1"
    ],
    "dark": [
      "#E2E8F0",
      "#94A3B8",
      "#67E8F9",
      "#0F172A",
      "#1E293B",
      "#F8FAFC",
      "#CBD5E1",
      "#475569"
    ]
  },
  "gold": {
    "light": [
      "#9A6700",
      "#6B4E16",
      "#B45309",
      "#FFFCF2",
      "#FFF4D6",
      "#2C210C",
      "#594B32",
      "#D9C28E"
    ],
    "dark": [
      "#FACC15",
      "#EAB308",
      "#FDE68A",
      "#1C170B",
      "#302711",
      "#FFF9E6",
      "#CFC29B",
      "#796333"
    ]
  },
  "silver": {
    "light": [
      "#475569",
      "#64748B",
      "#0E7490",
      "#F8FAFC",
      "#E9EEF3",
      "#111827",
      "#475569",
      "#B9C3CF"
    ],
    "dark": [
      "#E2E8F0",
      "#94A3B8",
      "#67E8F9",
      "#111827",
      "#1F2937",
      "#F8FAFC",
      "#CBD5E1",
      "#475569"
    ]
  },
  "copper": {
    "light": [
      "#9A3412",
      "#7C2D12",
      "#B45309",
      "#FFFAF5",
      "#FFF1E6",
      "#31170E",
      "#654838",
      "#D8B6A1"
    ],
    "dark": [
      "#FDBA74",
      "#FB923C",
      "#FDE68A",
      "#21130F",
      "#38211A",
      "#FFF7ED",
      "#D6B8A7",
      "#895841"
    ]
  },
  "ruby": {
    "light": [
      "#BE123C",
      "#9F1239",
      "#7C3AED",
      "#FFF7F9",
      "#FFEAF0",
      "#3B0A1B",
      "#6D3349",
      "#F5B8CB"
    ],
    "dark": [
      "#FDA4AF",
      "#FB7185",
      "#F0ABFC",
      "#210B16",
      "#391322",
      "#FFF1F2",
      "#D8A7B8",
      "#89344C"
    ]
  },
  "orchid": {
    "light": [
      "#9333EA",
      "#7E22CE",
      "#DB2777",
      "#FDF8FF",
      "#F3E8FF",
      "#2E1065",
      "#6B3A80",
      "#D8B4FE"
    ],
    "dark": [
      "#E9D5FF",
      "#C084FC",
      "#F9A8D4",
      "#1B1026",
      "#301B43",
      "#FAF5FF",
      "#D8B4E8",
      "#6B3A80"
    ]
  },
  "aurora": {
    "light": [
      "#0F766E",
      "#0369A1",
      "#7C3AED",
      "#F0FDFA",
      "#FFFFFF",
      "#102A2B",
      "#48615F",
      "#99F6E4"
    ],
    "dark": [
      "#5EEAD4",
      "#7DD3FC",
      "#C4B5FD",
      "#071F24",
      "#11313A",
      "#F0FDFA",
      "#B7D9D8",
      "#2C6B72"
    ]
  },
  "desert": {
    "light": [
      "#A16207",
      "#9A3412",
      "#0F766E",
      "#FFFBF3",
      "#FFF4DF",
      "#33220F",
      "#6B5037",
      "#E7CFA7"
    ],
    "dark": [
      "#FCD34D",
      "#FDBA74",
      "#5EEAD4",
      "#231B12",
      "#392A1B",
      "#FFF7E6",
      "#D7C0A0",
      "#826443"
    ]
  },
  "frost": {
    "light": [
      "#0E7490",
      "#2563EB",
      "#0891B2",
      "#F3FAFC",
      "#E7F5F9",
      "#102A38",
      "#426171",
      "#B6DCE7"
    ],
    "dark": [
      "#67E8F9",
      "#93C5FD",
      "#C4B5FD",
      "#0B1825",
      "#152B3B",
      "#F0F9FF",
      "#BDD4E2",
      "#3A6478"
    ]
  }
};
const presetNames = {
  "ar": {
    "classic": "كلاسيكي",
    "midnight": "ليلي",
    "warm": "دافئ",
    "ocean": "محيط",
    "forest": "غابة",
    "royal": "ملكي",
    "sunset": "غروب",
    "graphite": "جرافيت",
    "gold": "ذهبي",
    "silver": "فضي",
    "copper": "نحاسي",
    "ruby": "ياقوتي",
    "orchid": "أوركيد",
    "aurora": "شفق",
    "desert": "صحراوي",
    "frost": "جليدي"
  },
  "en": {
    "classic": "Classic",
    "midnight": "Midnight",
    "warm": "Warm",
    "ocean": "Ocean",
    "forest": "Forest",
    "royal": "Royal",
    "sunset": "Sunset",
    "graphite": "Graphite",
    "gold": "Gold",
    "silver": "Silver",
    "copper": "Copper",
    "ruby": "Ruby",
    "orchid": "Orchid",
    "aurora": "Aurora",
    "desert": "Desert",
    "frost": "Frost"
  }
};
const samplePresets = Object.entries(previewPresetPalettes).map(([id, modes]) => ({
  id, tier: ['classic', 'midnight', 'warm'].includes(id) ? 'FREE' : 'THEME_PRO',
  configuration: { ...sampleTheme, modes: {
    light: { ...samplePart('light'), presetId: id, colors: Object.fromEntries(colorKeys.map((key, index) => [key, modes.light[index]])) },
    dark: { ...samplePart('dark'), presetId: id, colors: Object.fromEntries(colorKeys.map((key, index) => [key, modes.dark[index]])) },
  } },
}));
const copy = {
  ar: {
    title: 'مظهر المنصة', subtitle: 'صمّم مظهرًا مستقلًا للوضع الفاتح والغامق، ثم عاين النتيجة قبل النشر.',
    previewNotice: 'هذه معاينة للتصميم فقط. لإنشاء طلب تحويل حقيقي، افتح صفحة الأدمن بعد تشغيل الباك إند.',
    previewOrderHint: 'لا يمكن إنشاء رقم طلب أو إرسال تحويل من المعاينة. افتح صفحة الأدمن لإنشاء طلب مسجل أولًا.',
    offerEyebrow: 'عرض خاص للثيمات', offerHeadline: 'استمتع بمميزات الثيمات لمدة 3 أشهر فقط',
    offerOld: 'بدلًا من 50$ لنفس المدة', offerNew: '24.99$ فقط',
    offerPayment: 'التحويل: 24.99 USDT صافي · دفعة واحدة', offerAction: 'شاهد المميزات والاشتراك', offerClose: 'إغلاق العرض', offerOpen: 'عرض اشتراك الثيمات',
    offerBackendOutdated: 'يجب تحديث خدمة الاشتراك إلى عرض 3 أشهر قبل إنشاء طلب تحويل.',
    openAdminOrder: 'افتح صفحة الأدمن لإنشاء طلب التحويل',
    light: 'الوضع الفاتح', dark: 'الوضع الغامق', presets: 'الثيمات الجاهزة', colors: 'الألوان', typography: 'الخطوط',
    components: 'تفاصيل الواجهة', branding: 'صور المنصة', livePreview: 'معاينة مباشرة',
    neonTitle: 'حدود النيون المتحركة', neonHint: 'اختر لونًا وسرعة مختلفين لكل قسم في الوضع الفاتح والغامق.',
    neonPurchase: 'نافذة الشراء', neonHero: 'السلايدر الرئيسي', neonCategories: 'الأقسام الرئيسية', neonBestSellers: 'الأكثر مبيعًا',
    categoryDefault: 'الإعداد الافتراضي لكل الأقسام', categoryNeonHint: 'عاين أقسام الصفحة الرئيسية الفعلية، واختر لكل قسم لونًا وسرعة مختلفين في الوضع الحالي.', noHomepageCategories: 'لا توجد أقسام رئيسية متاحة الآن. ستظهر هنا بعد تحميل أقسام المتجر.',
    neonEnabled: 'تفعيل', neonSpeed: 'سرعة الدوران', neonDemo: 'معاينة تأثير النيون',
    primary: 'الأساسي', secondary: 'الثانوي', accent: 'التمييز', background: 'الخلفية', surface: 'البطاقات', text: 'النص', mutedText: 'النص الثانوي', border: 'الحدود',
    arabicFont: 'الخط العربي', englishFont: 'الخط الإنجليزي', baseSize: 'حجم النص', headingWeight: 'وزن العناوين',
    buttonRadius: 'استدارة الأزرار', buttonStyle: 'شكل الأزرار', cardRadius: 'استدارة البطاقات', cardShadow: 'ظل البطاقات', navigation: 'القائمة',
    solid: 'ممتلئ', outline: 'محدد', none: 'بدون', subtle: 'خفيف', medium: 'متوسط', standard: 'عادي', compact: 'مدمج',
    save: 'حفظ المسودة', reset: 'إعادة المسودة', publish: 'نشر الثيمين', restore: 'استعادة ونشر',
    free: 'مجاني', paid: 'اشتراك Pro نشط', pro: 'Pro', lock: 'للمشتركين',
    freeLocked: 'هذه الإعدادات تحتاج اشتراك Pro موثقًا. يمكنك تعديل الألوان والثيمات المجانية للوضعين.',
    currentPlan: 'حالة النشر', lastPublish: 'آخر نشر', nextEdit: 'النشر المجاني التالي', expires: 'ينتهي الاشتراك',
    history: 'سجل النشر', payments: 'طلبات التحويل', empty: 'لا توجد سجلات بعد.',
    paymentStates: { PENDING: 'بانتظار مراجعة التحويل', VERIFIED: 'تم التحقق؛ أدخل كود التفعيل', FAILED: 'فشل', CANCELLED: 'ملغي', REFUNDED: 'مسترد', CHARGEBACK: 'مسترجع' },
    plan: 'Theme Customization Pro', planPrice: '24.99 USDT صافي', duration: '3 أشهر تقويمية · دفعة واحدة · بدون تجديد تلقائي',
    benefitsTitle: 'اشترك وسيفتح لك', benefits: ['نشر الثيمات بلا انتظار 30 يومًا', '13 ثيمًا إضافيًا للفاتح والغامق',
      'خطوط عربية وإنجليزية إضافية', 'حجم النص والأزرار والبطاقات والقائمة', 'تغيير صور السلايدر الأربع واللوجو وحجمه', 'تعديل النص العربي المتحرك أسفل السلايدر',
      'حدود نيون متحركة حول الشراء والسلايدر والأقسام والأكثر مبيعًا بألوان وسرعات مستقلة'],
    transferTitle: 'تحويل USDT يدوي', network: 'طريقة التحويل', destination: 'جهة التحويل', payee: 'اسم المستلم',
    copy: 'نسخ', copied: 'تم النسخ', request: 'إنشاء طلب التحويل', whatsapp: 'إرسال إثبات التحويل عبر واتساب',
    proof: 'بعد التحويل، أرسل لقطة شاشة الإثبات عبر واتساب. بعد التحقق من وصول المبلغ ستتلقى كود التفعيل، ولا يفتح Pro حتى تدخله.',
    activationTitle: 'تفعيل الاشتراك بالكود المؤقت', activationHint: 'بعد مراجعة وصول 24.99 USDT، سيصلك كود من 10 أرقام. صلاحيته 48 ساعة ويُستخدم مرة واحدة.',
    activationCode: 'كود التفعيل', activate: 'تفعيل Pro', activated: 'تم تفعيل الاشتراك بنجاح.',
    activationOrderNeeded: 'أنشئ طلب التحويل أولًا، ثم أدخل كود التفعيل بعد تأكيد الدفع.',
    noPaymentReady: 'تعليمات التحويل غير متاحة حتى يتصل التطبيق بالباك إند.',
    animatedArabic: 'النص العربي المتحرك', animatedArabicHint: 'تعديل النص الظاهر أسفل السلايدر متاح للمشتركين في Pro فقط (حتى 240 حرفًا).',
    logo: 'شعار المنصة', logoWidth: 'عرض الشعار', slides: 'صور السلايدر الرئيسية', imageHint: 'JPG أو PNG أو WebP، بحد أقصى 5MB',
    upload: 'رفع صورة', remove: 'إزالة', sample: 'زر تجريبي', sampleText: 'هذه معاينة للألوان والخطوط والبطاقات في الوضع المحدد.',
    retry: 'إعادة المحاولة', partial: 'تعذر تحميل بعض بيانات الاشتراك أو السجل، ويمكنك تعديل الثيم.', loading: 'جارٍ التحميل...',
    unavailable: 'يتطلب المحرر الاتصال بالباك إند الحقيقي.', networkError: 'تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى.',
    missingApi: 'محرر مظهر المنصة غير متاح على الخادم الحالي. يلزم تحديث الخدمة.', unauthorized: 'انتهت صلاحية الجلسة.',
    forbidden: 'لا تملك صلاحية تعديل مظهر المنصة.', failed: 'تعذرت العملية.', saved: 'تم حفظ المسودة.', published: 'تم النشر.', resetDone: 'تمت إعادة المسودة.',
  },
  en: {
    title: 'Platform Appearance', subtitle: 'Design separate light and dark appearances and preview before publishing.',
    previewNotice: 'This is a design preview. Open the admin page with a running backend to create a real transfer order.',
    previewOrderHint: 'The preview cannot issue an order reference or record a transfer. Open the admin page to create a recorded order first.',
    offerEyebrow: 'Special theme offer', offerHeadline: 'Enjoy theme features for 3 months',
    offerOld: 'Instead of $50 for the same term', offerNew: 'Only $24.99',
    offerPayment: 'Transfer 24.99 USDT net · one payment', offerAction: 'See features and subscribe', offerClose: 'Close offer', offerOpen: 'View theme subscription',
    offerBackendOutdated: 'The subscription service must be updated to the 3-month offer before creating a transfer order.',
    openAdminOrder: 'Open admin page to create a transfer order',
    light: 'Light mode', dark: 'Dark mode', presets: 'Theme presets', colors: 'Colors', typography: 'Fonts',
    components: 'Interface details', branding: 'Platform images', livePreview: 'Live preview',
    neonTitle: 'Animated neon borders', neonHint: 'Set a different color and speed for each section in light and dark modes.',
    neonPurchase: 'Purchase window', neonHero: 'Homepage slider', neonCategories: 'Main categories', neonBestSellers: 'Best sellers',
    categoryDefault: 'Default for all categories', categoryNeonHint: 'Preview real homepage categories and give each one its own color and speed in this mode.', noHomepageCategories: 'No homepage categories are available yet. They will appear after the catalog loads.',
    neonEnabled: 'Enable', neonSpeed: 'Orbit speed', neonDemo: 'Neon preview',
    primary: 'Primary', secondary: 'Secondary', accent: 'Accent', background: 'Background', surface: 'Cards', text: 'Text', mutedText: 'Muted text', border: 'Border',
    arabicFont: 'Arabic font', englishFont: 'English font', baseSize: 'Base size', headingWeight: 'Heading weight',
    buttonRadius: 'Button radius', buttonStyle: 'Button style', cardRadius: 'Card radius', cardShadow: 'Card shadow', navigation: 'Navigation',
    solid: 'Solid', outline: 'Outline', none: 'None', subtle: 'Subtle', medium: 'Medium', standard: 'Standard', compact: 'Compact',
    save: 'Save draft', reset: 'Reset draft', publish: 'Publish both modes', restore: 'Restore and publish',
    free: 'Free', paid: 'Pro active', pro: 'Pro', lock: 'Subscriber feature',
    freeLocked: 'These settings require verified Pro access. Both modes still support free colors and presets.',
    currentPlan: 'Publishing status', lastPublish: 'Last published', nextEdit: 'Next free publish', expires: 'Subscription expires',
    history: 'Publish history', payments: 'Transfer requests', empty: 'No records yet.',
    paymentStates: { PENDING: 'Awaiting transfer review', VERIFIED: 'Verified; enter activation code', FAILED: 'Failed', CANCELLED: 'Cancelled', REFUNDED: 'Refunded', CHARGEBACK: 'Charged back' },
    plan: 'Theme Customization Pro', planPrice: '24.99 USDT net', duration: '3 calendar months · one payment · no automatic renewal',
    benefitsTitle: 'Subscription unlocks', benefits: ['Unlimited publishing during the term', '13 extra light and dark presets',
      'More Arabic and English fonts', 'Font sizing, buttons, cards, and navigation', 'Four homepage slides, logo, and logo size', 'Edit the animated Arabic text below the slider',
      'Animated neon borders for checkout, slider, categories, and best sellers with separate colors and speeds'],
    transferTitle: 'Manual USDT transfer', network: 'Transfer method', destination: 'Destination', payee: 'Recipient',
    copy: 'Copy', copied: 'Copied', request: 'Create transfer order', whatsapp: 'Send proof on WhatsApp',
    proof: 'After transfer, send the screenshot on WhatsApp. A code is sent after receipt is verified; enter it to unlock Pro.',
    activationTitle: 'Activate with a temporary code', activationHint: 'After 24.99 USDT receipt is verified, you receive a 10-digit code. It lasts 48 hours and works once.',
    activationCode: 'Activation code', activate: 'Activate Pro', activated: 'Subscription activated.',
    activationOrderNeeded: 'Create a transfer order first, then enter the activation code after payment verification.',
    noPaymentReady: 'Transfer instructions require a backend connection.',
    animatedArabic: 'Animated Arabic text', animatedArabicHint: 'Pro subscribers can edit the text below the slider (up to 240 characters).',
    logo: 'Platform logo', logoWidth: 'Logo width', slides: 'Homepage slider images', imageHint: 'JPG, PNG, or WebP up to 5MB',
    upload: 'Upload image', remove: 'Remove', sample: 'Sample button', sampleText: 'Preview colors, fonts, and cards in the selected mode.',
    retry: 'Retry', partial: 'Some subscription or history details could not be loaded; you can still edit.', loading: 'Loading...',
    unavailable: 'Connect the real backend to use this editor.', networkError: 'Cannot reach the server. Check your connection and retry.',
    missingApi: 'Platform appearance is unavailable on the current server. The service needs an update.', unauthorized: 'Your session expired.',
    forbidden: 'This account cannot edit platform appearance.', failed: 'The action failed.', saved: 'Draft saved.', published: 'Published.', resetDone: 'Draft reset.',
  },
};
const dateText = (date, language) => date ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US',
  { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }).format(new Date(date)) : '—';
const errorText = (error, t) => {
  const status = error?.response?.status;
  if (!status) return t.networkError;
  if (status === 401) return t.unauthorized;
  if (status === 403 && error?.response?.data?.code === 'THEME_PRO_REQUIRED') return t.freeLocked;
  if (status === 403) return t.forbidden;
  if (status === 404 && error?.response?.data?.code === 'PAYMENT_NOT_VERIFIED') return t.paymentStates.PENDING;
  if (status === 404) return t.missingApi;
  return error?.response?.data?.message || t.failed;
};
const Section = ({ title, icon: Icon, locked = false, children }) => <section className={card}>
  <h2 className="mb-4 flex items-center gap-2 text-base font-black text-[var(--color-text)]"><Icon className="h-5 w-5 text-[var(--color-primary)]" />{title}{locked && <LockKeyhole className="ms-auto h-4 w-4 text-amber-500" />}</h2>{children}
</section>;
const Select = ({ label, value, values, onChange, disabled = false, labels = {}, suffix = '' }) => <label className="block text-sm text-[var(--color-text)]">{label}
  <select className={`${input} mt-1`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item} value={item}>{labels[item] || `${item}${suffix}`}</option>)}</select>
</label>;

export default function PlatformThemeEditor({ previewOnly = false }) {
  const { language } = useLanguage();
  const { categories, loadProducts } = useMediaStore();
  const [catalogCategories, setCatalogCategories] = useState(null);
  const { addToast } = useToast();
  const t = copy[language] || copy.ar;
  const languageRef = useRef(language);
  languageRef.current = language;
  const [mode, setMode] = useState('light');
  const [draft, setDraft] = useState(previewOnly ? sampleTheme : null);
  const [settings, setSettings] = useState(null);
  const [presets, setPresets] = useState(previewOnly ? samplePresets : []);
  const [manual, setManual] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [network, setNetwork] = useState('BINANCE_ID');
  const [order, setOrder] = useState(null);
  const [activationCode, setActivationCode] = useState('');
  const [history, setHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const activationReference = order?.reference || payments.find((item) => item.status === 'VERIFIED')?.providerReference || '';
  const [loading, setLoading] = useState(!previewOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [partial, setPartial] = useState(false);
  const [offerOpen, setOfferOpen] = useState(true);
  const offerCloseRef = useRef(null);
  useEffect(() => {
    if (!offerOpen) return undefined;
    const frame = window.requestAnimationFrame(() => offerCloseRef.current?.focus());
    const onKeyDown = (event) => { if (event.key === 'Escape') setOfferOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('keydown', onKeyDown); };
  }, [offerOpen]);
  const paid = settings?.eligibility?.plan === 'THEME_PRO';
  const part = draft?.modes?.[mode];
  const previewStyle = useMemo(() => platformThemeStyles(draft, mode), [draft, mode]);
  useEffect(() => {
    let active = true;
    if (!liveApi) { void loadProducts({ force: false }); return undefined; }
    void apiClient.publicCatalog.fetch()
      .then((catalog) => { if (active && Array.isArray(catalog?.categories)) setCatalogCategories(catalog.categories); })
      .catch(() => { if (active) void loadProducts({ force: false }); });
    return () => { active = false; };
  }, [loadProducts]);
  const homepageCategories = useMemo(() => createStorefrontCategories(
    Array.isArray(catalogCategories) ? catalogCategories : categories, [], language
  ).filter((category) => category.id !== 'all' && !category.parentCategory && /^[a-zA-Z0-9_-]{1,80}$/.test(category.id) && !['__proto__', 'constructor', 'prototype'].includes(category.id)),
  [catalogCategories, categories, language]);

  const refresh = useCallback(async (keepDraft = false) => {
    if (previewOnly || !liveApi) return;
    setLoading(true);
    try {
      const [settingsResult, presetsResult, historyResult, subscriptionResult, paymentsResult] = await Promise.allSettled([
        apiClient.platformTheme.getSettings(), apiClient.platformTheme.getPresets(), apiClient.platformTheme.getHistory(),
        apiClient.platformTheme.getSubscription(), apiClient.platformTheme.getPayments(),
      ]);
      if (settingsResult.status === 'rejected') throw settingsResult.reason;
      if (presetsResult.status === 'rejected') throw presetsResult.reason;
      const current = settingsResult.value;
      const options = presetsResult.value?.presets || [];
      setSettings(current);
      setPresets(options);
      setHistory(historyResult.status === 'fulfilled' ? historyResult.value?.items || [] : []);
      const paymentItems = paymentsResult.status === 'fulfilled' ? paymentsResult.value?.items || [] : [];
      setPayments(paymentItems);
      setManual(subscriptionResult.status === 'fulfilled' ? subscriptionResult.value?.manualPayment || null : null);
      setPaymentError(subscriptionResult.status === 'rejected'
        ? errorText(subscriptionResult.reason, copy[languageRef.current] || copy.ar) : '');
      setPartial([historyResult, subscriptionResult, paymentsResult].some((result) => result.status === 'rejected'));
      if (!keepDraft) setDraft(current?.draft || current?.published || options[0]?.configuration || null);
      setError('');
    } catch (cause) { setError(errorText(cause, copy[languageRef.current] || copy.ar)); }
    finally { setLoading(false); }
  }, [previewOnly]);
  useEffect(() => { refresh(); }, [refresh]);

  const updatePart = (section, key, value) => setDraft((current) => ({ ...current,
    modes: { ...current.modes, [mode]: { ...current.modes[mode], [section]: { ...current.modes[mode][section], [key]: value } } } }));
  const updateBrand = (change) => setDraft((current) => ({ ...current, brand: { ...current.brand, ...change } }));
  const updateNeon = (section, change) => setDraft((current) => ({ ...current,
    modes: { ...current.modes, [mode]: { ...current.modes[mode], neon: { ...current.modes[mode].neon,
      [section]: { ...current.modes[mode].neon[section], ...change } } } } }));
  const updateCategoryNeon = (categoryId, change) => setDraft((current) => {
    const appearance = current.modes[mode];
    const neon = appearance.neon || sampleNeon();
    const categoryCards = neon.categoryCards || {};
    const effect = categoryCards[categoryId] || neon.categories || sampleNeon().categories;
    return { ...current, modes: { ...current.modes, [mode]: { ...appearance,
      neon: { ...neon, categoryCards: { ...categoryCards, [categoryId]: { ...effect, ...change } } } } } };
  });
  const choosePreset = (entry) => setDraft((current) => ({ ...current,
    modes: { ...current.modes, [mode]: structuredClone(entry.configuration.modes[mode]) } }));
  const needsPro = draft && (Object.values(draft.modes).some((appearance) =>
    presets.find((item) => item.id === appearance.presetId)?.tier === 'THEME_PRO'
    || !freeFonts.arabic.includes(appearance.typography.arabicFont)
    || !freeFonts.english.includes(appearance.typography.englishFont)
    || appearance.typography.baseSize !== 16 || appearance.typography.headingWeight !== 700
    || appearance.buttons.radius !== 8 || appearance.buttons.style !== 'solid'
    || appearance.cards.radius !== 12 || appearance.cards.shadow !== 'subtle'
    || appearance.navigation.style !== 'standard'
    || neonSections.some((section) => JSON.stringify(appearance.neon?.[section]) !== JSON.stringify(sampleNeon()[section]))
    || Object.keys(appearance.neon?.categoryCards || {}).length > 0)
    || draft.brand.logoPath || draft.brand.logoWidth !== 144 || draft.brand.slides.some(Boolean)
    || (draft.brand.marqueeTextArabic ?? DEFAULT_MARQUEE_AR) !== DEFAULT_MARQUEE_AR);
  const run = async (action, success, keepDraft = false) => {
    if (previewOnly || !draft) return;
    setBusy(true);
    try {
      const result = await action();
      if (result?.published) window.dispatchEvent(new CustomEvent('platform-theme-published', { detail: result.published }));
      await refresh(keepDraft);
      addToast(success, 'success');
    } catch (cause) {
      const next = cause?.response?.data?.errors?.find?.((item) => item.field === 'nextFreeEditAt')?.value;
      addToast(next ? `${t.nextEdit}: ${dateText(next, language)}` : errorText(cause, t), 'error');
      if (cause?.response?.status === 429) await refresh(true);
    } finally { setBusy(false); }
  };
  const upload = async (file, slot = null) => {
    if (!paid || previewOnly || !file) return;
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast(t.imageHint, 'error'); return;
    }
    setBusy(true);
    try {
      const result = await apiClient.platformTheme.uploadMedia(file);
      if (slot === null) updateBrand({ logoPath: result.path });
      else setDraft((current) => ({ ...current, brand: { ...current.brand,
        slides: current.brand.slides.map((path, index) => index === slot ? result.path : path) } }));
    } catch (cause) { addToast(errorText(cause, t), 'error'); }
    finally { setBusy(false); }
  };
  const createOrder = async () => {
    if (previewOnly || !manual) return;
    if (manual.durationCalendarMonths !== 3) { addToast(t.offerBackendOutdated, 'error'); return; }
    setBusy(true);
    try {
      const result = await apiClient.platformTheme.createManualOrder(network);
      setOrder(result);
      await refresh(true);
    } catch (cause) { addToast(errorText(cause, t), 'error'); }
    finally { setBusy(false); }
  };
  const activateCode = async () => {
    if (previewOnly || !/^THEME-[0-9A-F-]{36}$/.test(activationReference.trim()) || !/^\d{10}$/.test(activationCode.trim())) return;
    setBusy(true);
    try {
      await apiClient.platformTheme.redeemCode(activationReference.trim(), activationCode.trim());
      setActivationCode('');
      await refresh(true);
      addToast(t.activated, 'success');
    } catch (cause) { addToast(errorText(cause, t), 'error'); }
    finally { setBusy(false); }
  };
  const copyValue = async (value) => { try { await navigator.clipboard.writeText(value); addToast(t.copied, 'success'); } catch { /* Browser may deny clipboard access. */ } };

  if (!previewOnly && !liveApi) return <div className={card}>{t.unavailable}</div>;
  if (loading && !draft) return <div className={card}>{t.loading}</div>;
  if (!draft || !part) return <div className={card}><p>{error || t.failed}</p><button type="button" className={`${button} mt-3`} onClick={() => refresh()}>{t.retry}</button></div>;

  return <main className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:px-6 sm:py-7">
    <header><h1 className="flex items-center gap-2 text-2xl font-black text-[var(--color-text)]"><Palette className="h-7 w-7 text-[var(--color-primary)]" />{t.title}</h1><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p></header>
    {!paid && !offerOpen && <button type="button" className="theme-offer-reopen" onClick={() => setOfferOpen(true)}><Sparkles className="h-4 w-4" />{t.offerOpen}</button>}
    {!paid && offerOpen && <div className="theme-offer-backdrop" role="presentation"><section className="theme-offer-window" role="dialog" aria-modal="true" aria-label={t.offerEyebrow}>
      <div className="theme-offer-window__content">
        <div className="theme-offer-window__bar" aria-hidden="true">
          <span className="theme-offer-window__lights"><i /><i /><i /></span>
          <span>THEME PRO · 03</span>
          <Sparkles className="h-4 w-4" />
        </div>
        <button ref={offerCloseRef} type="button" className="theme-offer-window__close" onClick={() => setOfferOpen(false)} aria-label={t.offerClose}>×</button>
        <div className="theme-offer-window__body">
          <span className="theme-offer-window__eyebrow"><Sparkles className="h-4 w-4" />{t.offerEyebrow}</span>
          <h2>{t.offerHeadline}</h2>
          <div className="theme-offer-window__price"><strong>{t.offerNew}</strong><del>{t.offerOld}</del></div>
          <p>{t.offerPayment}</p>
          <a href="#theme-subscription" className="theme-offer-window__action" onClick={() => setOfferOpen(false)}>{t.offerAction}<span aria-hidden="true">←</span></a>
        </div>
      </div>
    </section></div>}
    {(previewOnly || error || partial) && <div role="status" className={`${card} border-sky-500/40 text-sm text-[var(--color-text)]`}>{previewOnly ? t.previewNotice : error || t.partial}{!previewOnly && <button type="button" className={`${button} ms-3`} onClick={() => refresh(true)}>{t.retry}</button>}</div>}
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t.title}>{['light', 'dark'].map((value) => <button key={value} role="tab" aria-selected={mode === value} type="button" className={`${button} ${mode === value ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : ''}`} onClick={() => setMode(value)}>{t[value]}</button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,1fr)]">
      <div className="space-y-5">
        <Section icon={Sparkles} title={`${t.presets} · ${t[mode]}`}><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{presets.map((entry) => {
          const locked = entry.tier === 'THEME_PRO' && !paid;
          const palette = entry.configuration.modes[mode].colors;
          const active = part.presetId === entry.id;
          return <button key={entry.id} type="button" disabled={locked} aria-pressed={active}
            onClick={() => choosePreset(entry)} className={`theme-preset-card ${active ? 'theme-preset-card--active' : ''}`}>
            <span className="theme-preset-card__scene" style={{ backgroundColor: palette.background, borderColor: palette.border }}>
              <span className="theme-preset-card__panel" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
                <span className="theme-preset-card__title" style={{ color: palette.text }}>Aa</span>
                <span className="theme-preset-card__accent" style={{ backgroundColor: palette.primary }} />
                <span className="theme-preset-card__line" style={{ backgroundColor: palette.secondary }} />
              </span>
            </span>
            <span className="theme-preset-card__label"><span>{presetNames[language]?.[entry.id] || entry.id}</span>
              {locked ? <LockKeyhole className="h-4 w-4 text-amber-500" /> : entry.tier === 'THEME_PRO' ? <span className="theme-preset-card__pro">Pro</span> : null}
            </span>
          </button>;
        })}</div></Section>
        <Section icon={Palette} title={t.colors}><div className="grid gap-3 sm:grid-cols-2">{colorKeys.map((key) => <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"><span>{t[key]}</span><span className="flex items-center gap-2"><small dir="ltr">{part.colors[key]}</small><input type="color" aria-label={t[key]} value={part.colors[key]} onChange={(event) => updatePart('colors', key, event.target.value)} /></span></label>)}</div></Section>
        <Section icon={Palette} title={t.typography}><div className="grid gap-3 sm:grid-cols-2">{[['arabicFont', 'arabic'], ['englishFont', 'english']].map(([key, kind]) => <label key={key} className="text-sm text-[var(--color-text)]">{t[key]}<select className={`${input} mt-1`} value={part.typography[key]} onChange={(event) => updatePart('typography', key, event.target.value)}>{fonts[kind].map((font) => <option key={font} value={font} disabled={!paid && !freeFonts[kind].includes(font)}>{font}{!freeFonts[kind].includes(font) ? ' 🔒 Pro' : ''}</option>)}</select></label>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Select label={t.baseSize} value={part.typography.baseSize} values={[14,16,18,20]} disabled={!paid} onChange={(value) => updatePart('typography','baseSize',Number(value))} suffix="px" /><Select label={t.headingWeight} value={part.typography.headingWeight} values={[600,700,800]} disabled={!paid} onChange={(value) => updatePart('typography','headingWeight',Number(value))} /></div></Section>
        <Section icon={Palette} title={t.components} locked={!paid}><fieldset disabled={!paid} className="grid gap-3 sm:grid-cols-2 disabled:opacity-60"><Select label={t.buttonRadius} value={part.buttons.radius} values={[0,4,8,12,24]} suffix="px" onChange={(value) => updatePart('buttons','radius',Number(value))} /><Select label={t.buttonStyle} value={part.buttons.style} values={['solid','outline']} labels={t} onChange={(value) => updatePart('buttons','style',value)} /><Select label={t.cardRadius} value={part.cards.radius} values={[0,4,8,12,16,24]} suffix="px" onChange={(value) => updatePart('cards','radius',Number(value))} /><Select label={t.cardShadow} value={part.cards.shadow} values={['none','subtle','medium']} labels={t} onChange={(value) => updatePart('cards','shadow',value)} /><Select label={t.navigation} value={part.navigation.style} values={['standard','compact']} labels={t} onChange={(value) => updatePart('navigation','style',value)} /></fieldset></Section>
        <Section icon={Sparkles} title={t.neonTitle} locked={!paid}>
          <p className="mb-4 text-xs text-[var(--color-text-secondary)]">{t.neonHint}</p>
          <div className="grid gap-3 sm:grid-cols-2">{neonSections.map((section) => {
            const effect = part.neon?.[section] || sampleNeon()[section];
            const label = section === 'categories' ? t.categoryDefault : t[`neon${section[0].toUpperCase()}${section.slice(1)}`];
            return <div key={section} className="rounded-xl border border-[var(--color-border)] p-3">
              <div className="mb-3 platform-neon-border px-3 py-2 text-center text-sm font-bold" style={{ '--platform-neon-color': effect.color, '--platform-neon-speed': `${effect.speed}s` }}>{label}</div>
              <label className="flex items-center justify-between gap-2 text-sm"><span>{t.neonEnabled}</span><input type="checkbox" checked={effect.enabled} disabled={!paid} onChange={(event) => updateNeon(section, { enabled: event.target.checked })} /></label>
              <label className="mt-3 flex items-center justify-between gap-2 text-sm"><span>{t.colors}</span><input type="color" value={effect.color} disabled={!paid} onChange={(event) => updateNeon(section, { color: event.target.value })} /></label>
              <div className="mt-3"><Select label={t.neonSpeed} value={effect.speed} values={[3, 5, 8, 12]} suffix="s" disabled={!paid} onChange={(value) => updateNeon(section, { speed: Number(value) })} /></div>
            </div>;
          })}</div>
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <h3 className="text-sm font-black">{t.neonCategories}</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t.categoryNeonHint}</p>
            {homepageCategories.length === 0 ? <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{t.noHomepageCategories}</p> :
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{homepageCategories.map((category) => {
                const effect = part.neon?.categoryCards?.[category.id] || part.neon?.categories || sampleNeon().categories;
                return <div key={category.id} className="rounded-xl border border-[var(--color-border)] p-3">
                  <div className={`mx-auto mb-3 max-w-44 ${effect.enabled ? 'platform-neon-border' : ''}`} style={effect.enabled ? { '--platform-neon-color': effect.color, '--platform-neon-speed': `${effect.speed}s` } : undefined}>
                    <CategoryCard category={category} index={0} active={false} onSelect={() => {}} />
                  </div>
                  <p className="mb-3 text-center text-sm font-bold">{category.title}</p>
                  <label className="flex items-center justify-between gap-2 text-sm"><span>{t.neonEnabled}</span><input type="checkbox" checked={effect.enabled} disabled={!paid} onChange={(event) => updateCategoryNeon(category.id, { enabled: event.target.checked })} /></label>
                  <label className="mt-3 flex items-center justify-between gap-2 text-sm"><span>{t.colors}</span><input type="color" value={effect.color} disabled={!paid} onChange={(event) => updateCategoryNeon(category.id, { color: event.target.value })} /></label>
                  <div className="mt-3"><Select label={t.neonSpeed} value={effect.speed} values={[3, 5, 8, 12]} suffix="s" disabled={!paid} onChange={(value) => updateCategoryNeon(category.id, { speed: Number(value) })} /></div>
                </div>;
              })}</div>}
          </div>
        </Section>
        <Section icon={ImagePlus} title={t.branding} locked={!paid}><p className="mb-3 text-xs text-[var(--color-text-secondary)]">{t.imageHint}</p><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-[var(--color-border)] p-3"><p className="mb-2 text-sm font-bold">{t.logo}</p>{draft.brand.logoPath && <div className="mb-2 flex h-28 items-center overflow-auto rounded-lg bg-[var(--color-surface)] p-2"><img src={resolveImageUrl(draft.brand.logoPath)} alt="" className="max-h-full shrink-0 object-contain" style={{ width: draft.brand.logoWidth }} /></div>}<label className={button}>{t.upload}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!paid || busy} onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ''; }} /></label>{draft.brand.logoPath && <button type="button" className={`${button} ms-2`} disabled={!paid} onClick={() => updateBrand({ logoPath: null })}>{t.remove}</button>}<label className="mt-3 block text-xs">{t.logoWidth}: {draft.brand.logoWidth}px<input type="range" min="80" max="300" step="4" className="mt-2 w-full" disabled={!paid} value={draft.brand.logoWidth} onChange={(event) => updateBrand({ logoWidth: Number(event.target.value) })} /></label></div><div className="rounded-xl border border-[var(--color-border)] p-3"><p className="mb-2 text-sm font-bold">{t.slides}</p><div className="grid grid-cols-2 gap-2">{draft.brand.slides.map((path, index) => <div key={index} className="rounded-lg border border-[var(--color-border)] p-2 text-center text-xs"><div className="mb-2 flex aspect-video items-center justify-center overflow-hidden bg-[var(--color-surface)]">{path ? <img src={resolveImageUrl(path)} alt="" className="h-full w-full object-cover" /> : `${index + 1}`}</div><label className={button}>{t.upload}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!paid || busy} onChange={(event) => { upload(event.target.files?.[0], index); event.target.value = ''; }} /></label>{path && <button type="button" className="mt-1 block w-full text-rose-500" disabled={!paid} onClick={() => updateBrand({ slides: draft.brand.slides.map((old, slot) => slot === index ? null : old) })}>{t.remove}</button>}</div>)}</div></div></div></Section>
        <Section icon={Sparkles} title={t.animatedArabic} locked={!paid}>
          <p className="mb-3 text-xs text-[var(--color-text-secondary)]">{t.animatedArabicHint}</p>
          <textarea className={`${input} min-h-24 resize-y`} dir="rtl" lang="ar" maxLength={240}
            value={draft.brand.marqueeTextArabic ?? DEFAULT_MARQUEE_AR}
            disabled={!paid || busy}
            onChange={(event) => updateBrand({ marqueeTextArabic: event.target.value })} />
        </Section>
        {!paid && needsPro && <p className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-[var(--color-text)]">{t.freeLocked}</p>}
        <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={previewOnly || busy || !settings} onClick={() => run(() => apiClient.platformTheme.saveDraft(draft), t.saved, true)}><Save className="h-4 w-4" />{t.save}</button><button type="button" className={button} disabled={previewOnly || busy || !settings} onClick={() => run(() => apiClient.platformTheme.resetDraft(), t.resetDone)}><RotateCcw className="h-4 w-4" />{t.reset}</button><button type="button" className={`${button} border-[var(--color-primary)] bg-[var(--color-primary)] text-white`} disabled={previewOnly || busy || !settings?.eligibility?.canPublish || (!paid && needsPro)} onClick={() => run(() => apiClient.platformTheme.publish(draft), t.published)}><Check className="h-4 w-4" />{t.publish}</button></div>
      </div>
      <div className="space-y-5">
        <Section icon={Palette} title={`${t.livePreview} · ${t[mode]}`}><div style={previewStyle} className="overflow-hidden rounded-2xl border border-[var(--color-border)] text-[var(--color-text)]"><div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-bold">{t.title}</div><div className="space-y-4 bg-[var(--color-bg)] p-5" style={{ fontFamily: language === 'ar' ? previewStyle['--platform-font-ar'] : previewStyle['--platform-font-en'], fontSize: previewStyle['--platform-base-font-size'] }}><h3 style={{ fontWeight: part.typography.headingWeight }}>{t.title}</h3><p className="text-[var(--color-text-secondary)]">{t.sampleText}</p><div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4" style={{ borderRadius: part.cards.radius, boxShadow: previewStyle['--shadow-subtle'] }}>{t.sampleText}</div><button type="button" style={{ background: part.buttons.style === 'outline' ? 'transparent' : part.colors.primary, color: part.buttons.style === 'outline' ? part.colors.primary : previewStyle['--color-button-text'], borderRadius: part.buttons.radius, border: `1px solid ${part.colors.primary}`, padding: '8px 16px' }}>{t.sample}</button></div></div></Section>
        {!previewOnly && <Section icon={Clock3} title={t.currentPlan}><strong className="text-lg">{paid ? t.paid : t.free}</strong><div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]"><p>{t.lastPublish}: {dateText(settings?.eligibility?.lastSuccessfulPublishAt, language)}</p><p>{t.nextEdit}: {dateText(settings?.eligibility?.nextFreeEditAt, language)}</p>{paid && <p>{t.expires}: {dateText(settings?.eligibility?.subscription?.expiresAt, language)}</p>}</div></Section>}
        <div id="theme-subscription" className="scroll-mt-20"><Section icon={CreditCard} title={t.plan}><p className="text-xl font-black text-[var(--color-primary)]">{t.planPrice}</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.duration}</p><h3 className="mt-4 font-bold">{t.benefitsTitle}</h3><ul className="mt-2 space-y-2 text-sm">{t.benefits.map((benefit) => <li key={benefit} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{benefit}</li>)}</ul>{!paid && <div className="mt-5 border-t border-[var(--color-border)] pt-4"><h3 className="font-bold">{t.transferTitle}</h3>{previewOnly ? <div className="mt-2 space-y-3"><p className="text-sm text-[var(--color-text-secondary)]">{t.previewOrderHint}</p><Link className={`${button} w-full border-[var(--color-primary)] bg-[var(--color-primary)] text-white`} to="/admin/themes">{t.openAdminOrder}</Link></div> : manual ? <><p className="mt-2 text-sm">{t.payee}: <b>{manual.payeeName}</b></p><label className="mt-3 block text-sm">{t.network}<select className={`${input} mt-1`} value={network} onChange={(event) => { setNetwork(event.target.value); setOrder(null); }}>{Object.keys(manual.destinations).map((kind) => <option key={kind} value={kind}>{kind === 'BINANCE_ID' ? 'Binance ID' : kind}</option>)}</select></label><p className="mt-3 text-xs text-[var(--color-text-secondary)]">{t.destination}</p><div className="mt-1 flex items-center gap-2 rounded-xl bg-[var(--color-surface)] p-2"><code dir="ltr" className="min-w-0 flex-1 break-all text-xs">{manual.destinations[network]}</code><button type="button" className={button} onClick={() => copyValue(manual.destinations[network])}>{t.copy}</button></div><button type="button" className={`${button} mt-3 w-full`} disabled={busy || manual.durationCalendarMonths !== 3} onClick={createOrder}>{t.request}</button>{manual.durationCalendarMonths !== 3 && <p role="alert" className="mt-2 text-sm text-amber-600">{t.offerBackendOutdated}</p>}{order && <div className="mt-3 rounded-xl border border-emerald-500/40 p-3 text-sm"><a className={`${button} mt-3 w-full`} href={order.whatsappUrl} target="_blank" rel="noopener noreferrer">{t.whatsapp}</a></div>}<p className="mt-3 text-xs text-[var(--color-text-secondary)]">{t.proof}</p></> : <div className="mt-2 space-y-2 text-sm"><p role="alert">{paymentError || t.noPaymentReady}</p><button type="button" className={button} disabled={loading} onClick={() => refresh(true)}>{t.retry}</button></div>}</div>}</Section></div>
        {!paid && <Section icon={LockKeyhole} title={t.activationTitle}>
          <p className="mb-3 text-sm text-[var(--color-text-secondary)]">{t.activationHint}</p>{!previewOnly && !activationReference && <p role="status" className="mb-3 text-sm text-amber-600">{t.activationOrderNeeded}</p>}
          <div className="grid gap-3">
            <label className="text-sm">{t.activationCode}<input className={`${input} mt-1`} dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={activationCode} onChange={(event) => setActivationCode(event.target.value.replace(/\D/g, ''))} disabled={previewOnly || busy} placeholder="0000000000" /></label>
            <button type="button" className={`${button} border-[var(--color-primary)] bg-[var(--color-primary)] text-white`} disabled={previewOnly || busy || !/^THEME-[0-9A-F-]{36}$/.test(activationReference.trim()) || !/^\d{10}$/.test(activationCode)} onClick={activateCode}>{t.activate}</button>
          </div>
        </Section>}
        {!previewOnly && <Section icon={History} title={t.history}><div className="space-y-2">{history.length ? history.map((item) => <div key={item._id} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-surface)] p-3 text-sm"><span>#{item.version} · {dateText(item.publishedAt, language)}</span><button type="button" className={button} disabled={busy || !settings?.eligibility?.canPublish} onClick={() => run(() => apiClient.platformTheme.restore(item.version), t.published)}>{t.restore}</button></div>) : t.empty}</div></Section>}
        {!previewOnly && <Section icon={CreditCard} title={t.payments}><div className="space-y-2 text-sm">{payments.length ? payments.map((item) => <p key={item._id} className="rounded-xl bg-[var(--color-surface)] p-3"><b>{t.paymentStates[item.status] || item.status}</b> · {item.settlementAmount || '24.99'} USDT · {item.network || ''}<span className="block text-xs text-[var(--color-text-secondary)]">{dateText(item.createdAt, language)}</span></p>) : t.empty}</div></Section>}
      </div>
    </div>
  </main>;
}
