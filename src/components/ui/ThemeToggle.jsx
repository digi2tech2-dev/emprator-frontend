import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from './Button';

const variantStyles = {
  default: 'border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/0.78),rgb(var(--color-elevated-rgb)/0.58))] text-[var(--color-text)] backdrop-blur-xl',
  glass: 'border-[color:rgb(var(--color-border-rgb)/0.6)] bg-[color:rgb(var(--color-card-rgb)/0.62)] text-[var(--color-text)] backdrop-blur-xl',
};

const ThemeToggle = ({ className, compact = false, variant = 'default' }) => {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        `theme-toggle inline-flex ${compact ? 'h-8 w-8' : 'h-9 w-9'} items-center justify-center rounded-full border shadow-[var(--shadow-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.52)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]`,
        variantStyles[variant] || variantStyles.default,
        className
      )}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الغامق'}
      title={isDark ? 'الوضع الفاتح' : 'الوضع الغامق'}
      data-theme-mode={isDark ? 'dark' : 'light'}
    >
      <Icon className="h-[1.1rem] w-[1.1rem] transition-transform duration-200" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggle;
