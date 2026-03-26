import { X, FileSpreadsheet } from 'lucide-react';

interface SheetSelectorModalProps {
  fileName: string;
  sheetNames: string[];
  onSelectSheet: (sheetName: string) => void;
  onCancel: () => void;
}

/**
 * Modal for selecting a sheet from a multi-sheet Excel file.
 * Displays sheet names as clickable cards.
 * Uses Tailwind semantic classes for theme support (per Glimpse dark mode architecture).
 */
export function SheetSelectorModal({
  fileName,
  sheetNames,
  onSelectSheet,
  onCancel
}: SheetSelectorModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-xl p-6 bg-bg-page border border-border-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet
              size={24}
              className="text-text-primary"
            />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Select Sheet
              </h2>
              <p className="text-sm mt-1 text-text-secondary">
                {fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sheet list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sheetNames.map((sheetName, index) => (
            <button
              key={sheetName}
              onClick={() => onSelectSheet(sheetName)}
              className="w-full text-left px-4 py-3 rounded-lg transition-all bg-bg-surface border border-border-default text-text-primary hover:bg-bg-hover hover:border-border-hover"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{sheetName}</span>
                {index === 0 && (
                  <span className="text-xs px-2 py-1 rounded bg-text-secondary/20 text-text-secondary">
                    Default
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-xs mt-4 text-center text-text-secondary">
          {sheetNames.length} sheet{sheetNames.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
}
