import { useMemo } from 'react';
import { useResolvedTheme } from './useResolvedTheme';

/**
 * Hook to read current theme colors.
 * Refactored to use React-driven state (via useResolvedTheme) to avoid
 * race conditions with DOM class updates.
 */
export function useThemeColors() {
  const resolvedTheme = useResolvedTheme();

  return useMemo(() => {
    // These colors match src/index.css
    if (resolvedTheme === 'dark') {
      return {
        // Matrix background colors
        matrixChar: '#3B9EFF',
        matrixBg: '#0F172A',

        // Correlation matrix colors
        correlationNegative: '#60A5FA',
        correlationPositive: '#F87171',

        // Common colors
        bgHover: '#1E293B',
        borderDefault: '#334155',
        primary: '#3B9EFF',
      };
    } else {
      // Light mode (default)
      return {
        // Matrix background colors
        matrixChar: '#0066CC',
        matrixBg: '#FFFFFF',

        // Correlation matrix colors
        correlationNegative: '#A6DEFF',
        correlationPositive: '#FFA6A6',

        // Common colors
        bgHover: '#F1F5F9',
        borderDefault: '#E2E8F0',
        primary: '#0066CC',
      };
    }
  }, [resolvedTheme]);
}
