import { X } from 'lucide-react';
import { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: 'Navigation',
    items: [
      { keys: ['←', '→'], description: 'Navigate between tabs (or columns in detail view)' },
      { keys: ['1'], description: 'Jump to Overview tab' },
      { keys: ['2'], description: 'Jump to Columns tab' },
      { keys: ['3'], description: 'Jump to Quality tab' },
    ],
  },
  {
    category: 'Actions',
    items: [
      { keys: ['Esc'], description: 'Close active modal' },
      { keys: ['?'], description: 'Show this help' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-surface border border-border-default rounded-lg shadow-xl w-full max-w-[calc(100vw-2rem)] md:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border-default">
          <h2 className="text-lg md:text-xl font-semibold text-text-primary">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-hover active:bg-bg-hover transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {shortcuts.map(({ category, items }) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    {/* Description */}
                    <span className="text-sm text-text-primary">{shortcut.description}</span>

                    {/* Keys */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-mono font-semibold text-text-primary bg-bg-page border border-border-default rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-text-secondary">or</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 bg-bg-page border-t border-border-default rounded-b-lg">
          <p className="text-xs text-text-secondary text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono font-semibold text-text-primary bg-bg-surface border border-border-default rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
