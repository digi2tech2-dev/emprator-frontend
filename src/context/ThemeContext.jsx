import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../services/client';
import { applyPublishedPlatformTheme } from '../theme/platformTheme';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = 'ka-card-theme';

const normalizeTheme = (value) => (value === 'light' || value === 'dark' ? value : null);

const getInitialTheme = () => {
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY)) || 'dark';
  } catch {
    return 'dark';
  }
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [publishedTheme, setPublishedTheme] = useState(null);
  const [draftPreviewTheme, setDraftPreviewTheme] = useState(null);
  const [isDraftPreview, setIsDraftPreview] = useState(false);
  const hasOwnPreference = useRef(null);
  if (hasOwnPreference.current === null) {
    try { hasOwnPreference.current = Boolean(normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))); }
    catch { hasOwnPreference.current = false; }
  }

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = theme;

    try {
      if (hasOwnPreference.current) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked in private browsing; the visual theme still applies.
    }
  }, [isDark, theme]);

  useEffect(() => {
    if ((import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase() !== 'real') return undefined;
    let active = true;
    apiClient.platformTheme.getPublished().then((result) => {
      if (!active) return;
      setPublishedTheme(result?.published || null);
      if (!hasOwnPreference.current && result?.published?.schemaVersion === 1 && normalizeTheme(result?.published?.mode)) {
        setThemeState(result.published.mode);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const previewMode = new URLSearchParams(window.location.search).get('themeDraftPreview') === '1';
    const receiveDraft = (event) => {
      if (!previewMode || event.origin !== window.location.origin || event.source !== window.parent
        || event.data?.type !== 'platform-theme-draft-preview' || event.data?.theme?.schemaVersion !== 2) return;
      setDraftPreviewTheme(event.data.theme);
      if (event.data.mode === 'light' || event.data.mode === 'dark') setThemeState(event.data.mode);
    };
    if (previewMode && window.parent !== window) setIsDraftPreview(true);
    if (previewMode && window.parent !== window) window.parent.postMessage({ type: 'platform-theme-preview-ready' }, window.location.origin);
    window.addEventListener('message', receiveDraft);
    return () => window.removeEventListener('message', receiveDraft);
  }, []);

  useEffect(() => {
    applyPublishedPlatformTheme(draftPreviewTheme || publishedTheme, theme);
  }, [draftPreviewTheme, publishedTheme, theme]);

  useEffect(() => {
    const onPublished = (event) => {
      setPublishedTheme(event.detail || null);
      if (!hasOwnPreference.current && event.detail?.schemaVersion === 1 && normalizeTheme(event.detail?.mode)) setThemeState(event.detail.mode);
    };
    window.addEventListener('platform-theme-published', onPublished);
    return () => window.removeEventListener('platform-theme-published', onPublished);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    hasOwnPreference.current = true;
    setThemeState((currentTheme) => {
      const resolvedTheme = typeof nextTheme === 'function' ? nextTheme(currentTheme) : nextTheme;
      return normalizeTheme(resolvedTheme) || currentTheme;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      publishedTheme: draftPreviewTheme || publishedTheme,
      isDraftPreview,
      toggleTheme,
      setTheme
    }),
    [theme, isDark, publishedTheme, draftPreviewTheme, isDraftPreview, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
