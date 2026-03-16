import { useEffect } from 'react';
import { useResolvedTheme } from './useResolvedTheme';

/**
 * Synchronizes the resolved theme state with the document class.
 * This ensures Tailwind's dark mode classes (.dark) are applied correctly.
 */
export function useThemeSync() {
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    const root = document.documentElement;
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);
}
