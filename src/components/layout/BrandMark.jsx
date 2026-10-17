import React from 'react';
import { cn } from '../ui/Button';
import brandIconImage from '../../assets/logo.webp';
// The new emperor logo is used consistently in both themes.
import brandIconLightImage from '../../assets/logo.webp';
import { useTheme } from '../../context/ThemeContext';
import { isSafeThemeMediaPath } from '../../theme/platformTheme';
import { resolveImageUrl } from '../../utils/imageUrl';

const stylesBySize = {
  xs: {
    wrapper: 'gap-2.5',
    iconShell: 'h-12 w-12 rounded-[9px]',
    title: 'text-[0.88rem]',
    caption: 'text-[0.54rem] tracking-[0.26em]',
  },
  sm: {
    wrapper: 'gap-3',
    iconShell: 'h-14 w-14 rounded-[10px]',
    title: 'text-[0.96rem]',
    caption: 'text-[0.58rem] tracking-[0.32em]',
  },
  md: {
    wrapper: 'gap-3.5',
    iconShell: 'h-16 w-16 rounded-[12px]',
    title: 'text-[1.05rem]',
    caption: 'text-[0.62rem] tracking-[0.34em]',
  },
  lg: {
    wrapper: 'gap-4',
    iconShell: 'h-20 w-20 rounded-[14px]',
    title: 'text-[1.16rem]',
    caption: 'text-[0.66rem] tracking-[0.38em]',
  },
};
const baseIconPixels = { xs: 48, sm: 56, md: 64, lg: 80 };

const BrandMark = ({
  className,
  compact = false,
  iconPosition = 'start',
  showCaption = true,
  size = 'md',
  titleClassName,
  captionClassName,
}) => {
  const { isDark, publishedTheme } = useTheme();
  const customLogo = publishedTheme?.brand?.logoPath;
  const logo = isSafeThemeMediaPath(customLogo) ? resolveImageUrl(customLogo) : null;
  const width = publishedTheme?.brand?.logoWidth;
  const scaledSize = Number.isInteger(width) && width >= 80 && width <= 300
    ? Math.round(baseIconPixels[size] * width / 144) : null;
  const styles = stylesBySize[size] || stylesBySize.md;
  const isIconEnd = iconPosition === 'end';

  return (
    <div className={cn('flex items-center', isIconEnd && 'flex-row-reverse', styles.wrapper, className)}>
      <div className={cn('relative shrink-0 overflow-hidden', styles.iconShell)} style={scaledSize ? { width: scaledSize, height: scaledSize } : undefined}>
        <img
          src={logo || (isDark ? brandIconImage : brandIconLightImage)}
          alt="EMBRATOR CARD"
          loading="eager"
          decoding="async"
          className="relative h-full w-full object-contain"
        />
      </div>

      {!compact && (
        <div className="min-w-0">
          <p
            className={cn(
              "ka-brand-title whitespace-nowrap font-['Orbitron'] font-extrabold",
              styles.title,
              titleClassName
            )}
          >
            <span className="bg-[linear-gradient(110deg,#ffd36a_0%,#f59e0b_42%,#c2410c_100%)] bg-clip-text text-transparent">
              EMBRATOR
            </span>
            <span className="mx-1 text-[color:rgb(var(--color-text-secondary)/0.5)]">·</span>
            <span className="text-[color:rgb(var(--color-text-secondary)/0.86)]">CARD</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandMark;
