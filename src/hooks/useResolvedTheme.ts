import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook to resolve the actual theme ('light' or 'dark').
 * Handles 'system' mode logic by checking media queries.
 */
export function useResolvedTheme() {
  const theme = useAppStore((state) => state.theme);
  
  // Initialize state based on current preference
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  });

  useEffect(() => {
    // Handle non-system themes
    if (theme !== 'system') {
      // Schedule state update to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => setResolvedTheme(theme), 0);
      return () => clearTimeout(timeoutId);
    }

    // Handle 'system' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for OS changes
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return resolvedTheme;
}
