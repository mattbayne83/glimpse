import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { AnalysisResult } from '../types/analysis';
import { Histogram } from './Histogram';

interface ColumnDetailModalProps {
  columnName: string;
  result: AnalysisResult;
  onClose: () => void;
}

export function ColumnDetailModal({ columnName, result, onClose }: ColumnDetailModalProps) {
  const column = result.columns.find((col) => col.name === columnName);

  // Lock body scroll when modal is open
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ESC key support
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!column) {
    return null;
  }

  const { analysis } = column;
  const type = analysis.type;

  // Get type badge color
  const typeColors = {
    numeric: 'bg-secondary-light text-secondary',
    categorical: 'bg-primary-light text-primary',
    datetime: 'bg-warning-bg text-warning-text',
  };

  // Calculate completeness for quality section
  const totalRows = result.overview.rows;
  const missingCount = analysis.stats.missing || 0;
  const completeness = totalRows > 0 ? ((totalRows - missingCount) / totalRows) * 100 : 100;

  // Get correlations for this column (if numeric)
  const correlations: Array<{ name: string; value: number }> = [];
  if (type === 'numeric' && result.correlation) {
    const columnIndex = result.correlation.columns.indexOf(columnName);
    if (columnIndex !== -1) {
      result.correlation.columns.forEach((otherCol, idx) => {
        if (otherCol !== columnName) {
          const corrValue = result.correlation!.matrix[columnIndex][idx];
          correlations.push({ name: otherCol, value: corrValue });
        }
      });
      // Sort by absolute correlation value (strongest first)
      correlations.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-bg-surface shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface border-b border-border-default px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-primary truncate">{columnName}</h2>
            <span
              className={`inline-block mt-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${typeColors[type]}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Statistics Section */}
          <section>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Statistics</h3>
            <div className="bg-bg-page rounded-lg p-4 space-y-2">
              {type === 'numeric' && (
                <>
                  <StatRow label="Count" value={analysis.stats.count.toLocaleString()} />
                  <StatRow label="Mean" value={analysis.stats.mean?.toFixed(2) || 'N/A'} />
                  <StatRow label="Std Dev" value={analysis.stats.std?.toFixed(2) || 'N/A'} />
                  <StatRow label="Min" value={analysis.stats.min?.toFixed(2) || 'N/A'} />
                  <StatRow label="25%" value={analysis.stats.q25?.toFixed(2) || 'N/A'} />
                  <StatRow label="Median" value={analysis.stats.q50?.toFixed(2) || 'N/A'} />
                  <StatRow label="75%" value={analysis.stats.q75?.toFixed(2) || 'N/A'} />
                  <StatRow label="Max" value={analysis.stats.max?.toFixed(2) || 'N/A'} />
                </>
              )}

              {type === 'categorical' && (
                <>
                  <StatRow label="Unique Values" value={analysis.stats.uniqueCount.toLocaleString()} />
                  <StatRow label="Total Count" value={totalRows.toLocaleString()} />
                </>
              )}

              {type === 'datetime' && (
                <>
                  <StatRow label="Unique Dates" value={analysis.stats.uniqueCount.toLocaleString()} />
                  <StatRow label="Min Date" value={analysis.stats.minDate || 'N/A'} />
                  <StatRow label="Max Date" value={analysis.stats.maxDate || 'N/A'} />
                </>
              )}

              <StatRow
                label="Missing"
                value={`${missingCount.toLocaleString()} (${((missingCount / totalRows) * 100).toFixed(1)}%)`}
              />
            </div>
          </section>

          {/* Distribution Section (Numeric only) */}
          {type === 'numeric' && analysis.stats.histogram && (
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Distribution</h3>
              <div className="bg-bg-page rounded-lg p-4">
                <Histogram
                  bins={analysis.stats.histogram.bins}
                  counts={analysis.stats.histogram.counts}
                  width={432}
                  height={120}
                />
              </div>
            </section>
          )}

          {/* Top Values (Categorical only) */}
          {type === 'categorical' && analysis.stats.topValues && (
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Top Values</h3>
              <div className="bg-bg-page rounded-lg p-4 space-y-3">
                {analysis.stats.topValues.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary font-medium truncate flex-1 mr-4">
                      {item.value}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-text-secondary">{item.count.toLocaleString()}</span>
                      <span className="text-primary font-medium min-w-[48px] text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Data Quality Section */}
          <section>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Data Quality</h3>
            <div className="bg-bg-page rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-primary font-medium">Completeness</span>
                  <span className="text-primary font-semibold">{completeness.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-border-default rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completeness >= 95
                        ? 'bg-success'
                        : completeness >= 80
                        ? 'bg-warning'
                        : completeness >= 50
                        ? 'bg-warning'
                        : 'bg-error'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              {missingCount > 0 && (
                <div className="pt-2 border-t border-border-default">
                  <p className="text-xs text-text-secondary">
                    {missingCount.toLocaleString()} missing values out of {totalRows.toLocaleString()} total rows
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Correlations Section (Numeric only) */}
          {type === 'numeric' && correlations.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Correlations</h3>
              <div className="bg-bg-page rounded-lg p-4 space-y-2">
                {correlations.slice(0, 5).map((corr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary font-medium truncate flex-1 mr-4">
                      {corr.name}
                    </span>
                    <span
                      className={`font-semibold min-w-[56px] text-right ${
                        Math.abs(corr.value) > 0.7
                          ? 'text-error'
                          : Math.abs(corr.value) > 0.3
                          ? 'text-warning'
                          : 'text-text-secondary'
                      }`}
                    >
                      {corr.value.toFixed(2)}
                    </span>
                  </div>
                ))}
                {correlations.length > 5 && (
                  <p className="text-xs text-text-secondary pt-2 border-t border-border-default">
                    +{correlations.length - 5} more correlations
                  </p>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Strong: |r| &gt; 0.7 • Moderate: 0.3 &lt; |r| &lt; 0.7 • Weak: |r| &lt; 0.3
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// Helper component for stat rows
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}
