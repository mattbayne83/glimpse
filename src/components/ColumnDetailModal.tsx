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
    numeric: 'bg-[#DBEAFE] text-[#1E40AF]',
    categorical: 'bg-[#F3E8FF] text-[#6B21A8]',
    datetime: 'bg-[#FEF3C7] text-[#92400E]',
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
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#0F172A] truncate">{columnName}</h2>
            <span
              className={`inline-block mt-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${typeColors[type]}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Statistics Section */}
          <section>
            <h3 className="text-sm font-semibold text-[#334155] mb-3">Statistics</h3>
            <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-2">
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
              <h3 className="text-sm font-semibold text-[#334155] mb-3">Distribution</h3>
              <div className="bg-[#F8FAFC] rounded-lg p-4">
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
              <h3 className="text-sm font-semibold text-[#334155] mb-3">Top Values</h3>
              <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
                {analysis.stats.topValues.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-[#334155] font-medium truncate flex-1 mr-4">
                      {item.value}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[#64748B]">{item.count.toLocaleString()}</span>
                      <span className="text-[#0066CC] font-medium min-w-[48px] text-right">
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
            <h3 className="text-sm font-semibold text-[#334155] mb-3">Data Quality</h3>
            <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#334155] font-medium">Completeness</span>
                  <span className="text-[#0066CC] font-semibold">{completeness.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completeness >= 95
                        ? 'bg-[#10B981]'
                        : completeness >= 80
                        ? 'bg-[#F59E0B]'
                        : completeness >= 50
                        ? 'bg-[#F97316]'
                        : 'bg-[#EF4444]'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              {missingCount > 0 && (
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B]">
                    {missingCount.toLocaleString()} missing values out of {totalRows.toLocaleString()} total rows
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Correlations Section (Numeric only) */}
          {type === 'numeric' && correlations.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-[#334155] mb-3">Correlations</h3>
              <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-2">
                {correlations.slice(0, 5).map((corr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-[#334155] font-medium truncate flex-1 mr-4">
                      {corr.name}
                    </span>
                    <span
                      className={`font-semibold min-w-[56px] text-right ${
                        Math.abs(corr.value) > 0.7
                          ? 'text-[#DC2626]'
                          : Math.abs(corr.value) > 0.3
                          ? 'text-[#F59E0B]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {corr.value.toFixed(2)}
                    </span>
                  </div>
                ))}
                {correlations.length > 5 && (
                  <p className="text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                    +{correlations.length - 5} more correlations
                  </p>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-2">
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
      <span className="text-[#64748B]">{label}</span>
      <span className="text-[#0F172A] font-medium">{value}</span>
    </div>
  );
}
