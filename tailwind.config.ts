import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector', // Use .dark class for dark mode
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-page': 'var(--color-bg-page)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-hover': 'var(--color-bg-hover)',

        // Borders
        'border-default': 'var(--color-border-default)',
        'border-hover': 'var(--color-border-hover)',

        // Text
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',

        // Brand
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'primary-border': 'var(--color-primary-border)',
        secondary: 'var(--color-secondary)',
        'secondary-light': 'var(--color-secondary-light)',

        // Semantic
        success: 'var(--color-success)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
        'success-text': 'var(--color-success-text)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-border': 'var(--color-warning-border)',
        'warning-text': 'var(--color-warning-text)',
        error: 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        'error-border': 'var(--color-error-border)',
        'error-text': 'var(--color-error-text)',

        // Quality indicators
        'quality-excellent-bg': 'var(--color-quality-excellent-bg)',
        'quality-excellent-text': 'var(--color-quality-excellent-text)',
        'quality-good-bg': 'var(--color-quality-good-bg)',
        'quality-good-text': 'var(--color-quality-good-text)',
        'quality-fair-bg': 'var(--color-quality-fair-bg)',
        'quality-fair-text': 'var(--color-quality-fair-text)',
        'quality-poor-bg': 'var(--color-quality-poor-bg)',
        'quality-poor-text': 'var(--color-quality-poor-text)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
    },
  },
  plugins: [],
} satisfies Config;
