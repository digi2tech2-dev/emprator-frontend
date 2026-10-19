import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, CreditCard, Home, PlusCircle, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import useAuthStore from '../../store/useAuthStore';
import { isAdminRole } from '../../utils/authRoles';

const StorefrontBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const { publishedTheme, isDraftPreview } = useTheme();
  const config = publishedTheme?.schemaVersion === 2 ? publishedTheme.chrome?.bottomNav : null;
  if (((isAdminRole(user?.role) || location.pathname.startsWith('/admin')) && !isDraftPreview) || location.pathname.startsWith('/auth')) return null;
  const ar = language === 'ar';
  const style = config ? { height: `${config.height}px`, width: `${config.width}%`, background: config.background, color: config.foreground, borderRadius: config.template === 'pill' ? '999px' : `${config.radius}px` } : undefined;
  const items = [
    [ClipboardList, ar ? 'طلباتي' : 'Orders', '/orders'],
    [PlusCircle, ar ? 'إضافة رصيد' : 'Add balance', '/wallet/add-balance'],
    [Home, ar ? 'الرئيسية' : 'Home', user ? '/dashboard' : '/'],
    [CreditCard, ar ? 'دفعاتي' : 'Payments', '/wallet/topup-history'],
    [Search, ar ? 'البحث' : 'Search', '/catalog#categories'],
  ];
  return <nav aria-label={ar ? 'التنقل السفلي' : 'Bottom navigation'} className={`storefront-bottom-nav storefront-bottom-nav--${config?.template || 'bar'}`} style={style}>
    {items.map(([Icon, label, target], index) => <NavLink key={label} to={target} onClick={(event) => { if (target.includes('#')) { event.preventDefault(); navigate('/catalog'); window.setTimeout(() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }), 80); } }} className={({ isActive }) => `storefront-bottom-nav__item ${(isActive || (index === 2 && location.pathname === '/')) ? 'is-active' : ''}`} style={{ '--platform-nav-accent': config?.accent || 'var(--color-primary)' }}>
      <Icon aria-hidden="true" /><span>{label}</span>
    </NavLink>)}
  </nav>;
};
export default StorefrontBottomNav;
