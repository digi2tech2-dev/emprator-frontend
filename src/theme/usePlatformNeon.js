import { useTheme } from '../context/ThemeContext';

const colorPattern = /^#[0-9a-f]{6}$/i;
const speeds = [3, 5, 8, 12];
const sections = ['purchase', 'hero', 'categories', 'bestSellers'];

export const usePlatformNeon = (section, categoryId = null) => {
  const { publishedTheme, theme } = useTheme();
  if (!sections.includes(section)) return { className: '', style: undefined };
  const neon = publishedTheme?.schemaVersion === 2 ? publishedTheme.modes?.[theme]?.neon : null;
  const effect = section === 'categories' && categoryId
    ? neon?.categoryCards?.[String(categoryId)] || neon?.categories
    : neon?.[section];
  if (effect?.enabled !== true || !colorPattern.test(effect.color || '') || !speeds.includes(effect.speed)) {
    return { className: '', style: undefined };
  }
  return { className: 'platform-neon-border', style: {
    '--platform-neon-color': effect.color,
    '--platform-neon-speed': `${effect.speed}s`,
  } };
};
