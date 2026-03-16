import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function ThemeToggle() {
  const { theme, setTheme } = useAppStore();

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border-default hover:border-border-hover rounded-md transition-colors duration-150"
      aria-label={`Theme: ${label}. Click to cycle.`}
      title={`Current theme: ${label}`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
