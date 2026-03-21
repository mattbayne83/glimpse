import { X, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Hash, CaseSensitive, CalendarClock } from 'lucide-react';
import { useEffect } from 'react';
import type { AnalysisResult } from '../types/analysis';
import { Histogram } from './Histogram';
import { RangeIndicator } from './RangeIndicator';
import { TimeSeriesPlot } from './TimeSeriesPlot';
import { BoxPlotVisualization } from './BoxPlotVisualization';

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

  // Get missing data info
  const totalRows = result.overview.rows;
  const missingCount = analysis.stats.missing || 0;

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

  // Smart insights for numeric columns
  const getSkewnessInsight = () => {
    if (type !== 'numeric') return null;
    const mean = analysis.stats.mean;
    const median = analysis.stats.q50;
    const diff = Math.abs(mean - median);
    const avgValue = (mean + median) / 2;
    const percentDiff = avgValue !== 0 ? (diff / avgValue) * 100 : 0;

    if (percentDiff < 5) {
      return { icon: Minus, color: 'text-emerald-600 dark:text-emerald-400', label: 'Symmetric', detail: 'mean ≈ median' };
    } else if (mean > median) {
      return { icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', label: 'Right-skewed', detail: 'mean > median' };
    } else {
      return { icon: TrendingDown, color: 'text-amber-600 dark:text-amber-400', label: 'Left-skewed', detail: 'mean < median' };
    }
  };

  const getSpreadInsight = () => {
    if (type !== 'numeric') return null;
    const mean = analysis.stats.mean;
    const std = analysis.stats.std;
    if (mean === 0) return null;

    const cv = (std / Math.abs(mean)) * 100; // Coefficient of variation

    if (cv < 30) {
      return { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', label: 'Low spread', detail: `${cv.toFixed(0)}% of mean` };
    } else if (cv < 70) {
      return { icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', label: 'Moderate spread', detail: `${cv.toFixed(0)}% of mean` };
    } else {
      return { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', label: 'High spread', detail: `${cv.toFixed(0)}% of mean` };
    }
  };

  const getMissingInsight = () => {
    const missingPct = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;

    if (missingPct === 0) {
      return { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', label: 'Complete' };
    } else if (missingPct < 5) {
      return { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', label: 'Mostly complete' };
    } else if (missingPct < 20) {
      return { icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', label: 'Some missing' };
    } else {
      return { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', label: 'Many missing' };
    }
  };

  // Detect distribution shape from histogram data
  const getDistributionShape = (): string | undefined => {
    if (type !== 'numeric' || !analysis.stats.histogram) return undefined;

    const { counts } = analysis.stats.histogram;
    if (counts.length < 5) return undefined; // Need enough bins to detect shape

    const maxCount = Math.max(...counts);
    const normalizedCounts = counts.map(c => c / maxCount);

    // Find peaks (local maxima)
    const peaks: number[] = [];
    for (let i = 1; i < normalizedCounts.length - 1; i++) {
      if (normalizedCounts[i] > normalizedCounts[i - 1] && normalizedCounts[i] > normalizedCounts[i + 1]) {
        // Only count significant peaks (>40% of max)
        if (normalizedCounts[i] > 0.4) {
          peaks.push(i);
        }
      }
    }

    // Check for bimodal (two distinct peaks)
    if (peaks.length >= 2) {
      // Make sure peaks are separated by at least 2 bins
      const peaksSeparated = peaks.some((p1, idx) =>
        peaks.slice(idx + 1).some(p2 => Math.abs(p2 - p1) >= 2)
      );
      if (peaksSeparated) return 'Bimodal';
    }

    // Check for uniform distribution (low variance in counts)
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    if (coefficientOfVariation < 0.3) {
      return 'Uniform';
    }

    // Use existing skewness logic for skew detection
    const mean_val = analysis.stats.mean;
    const median_val = analysis.stats.q50;
    const diff = Math.abs(mean_val - median_val);
    const avgValue = (mean_val + median_val) / 2;
    const percentDiff = avgValue !== 0 ? (diff / avgValue) * 100 : 0;

    // Check if peak is roughly in the middle (normal distribution)
    const peakIndex = normalizedCounts.indexOf(Math.max(...normalizedCounts));
    const middleIndex = normalizedCounts.length / 2;
    const peakInMiddle = Math.abs(peakIndex - middleIndex) < normalizedCounts.length * 0.2;

    if (percentDiff < 5 && peakInMiddle) {
      return 'Normal';
    } else if (mean_val > median_val) {
      return 'Right-skewed';
    } else if (mean_val < median_val) {
      return 'Left-skewed';
    }

    return undefined;
  };

  const skewnessInsight = getSkewnessInsight();
  const spreadInsight = getSpreadInsight();
  const missingInsight = getMissingInsight();
  const distributionShape = getDistributionShape();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 bottom-0 w-full md:max-w-[500px] bg-bg-surface/80 backdrop-blur-xl md:border-l border-border-default shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface/90 backdrop-blur-md border-b border-border-default px-4 md:px-8 py-4 md:py-6 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-text-primary truncate tracking-tight">{columnName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${typeColors[type]}`}
              >
                {type === 'numeric' && <Hash className="w-3.5 h-3.5" />}
                {type === 'categorical' && <CaseSensitive className="w-3.5 h-3.5" />}
                {type === 'datetime' && <CalendarClock className="w-3.5 h-3.5" />}
                {type}
              </span>
              {distributionShape && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                  {distributionShape}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 md:ml-4 p-2 md:p-2.5 text-text-secondary hover:text-text-primary active:text-text-primary hover:bg-bg-hover active:bg-bg-hover rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-x-hidden">
          {/* Statistics Section */}
          <section>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Statistics</h3>
            <div className="bg-bg-page rounded-lg p-4 space-y-3">
              {type === 'numeric' && (
                <>
                  {/* Basic stats */}
                  <div className="space-y-2">
                    <StatRow label="Count" value={analysis.stats.count.toLocaleString()} />
                    <StatRowWithInsight
                      label="Mean"
                      value={analysis.stats.mean?.toFixed(2) || 'N/A'}
                      insight={skewnessInsight}
                    />
                    <StatRowWithInsight
                      label="Std Dev"
                      value={analysis.stats.std?.toFixed(2) || 'N/A'}
                      insight={spreadInsight}
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border-default my-3" />

                  {/* Visual range indicator */}
                  <div className="overflow-x-auto">
                    <h4 className="text-xs font-medium text-text-secondary mb-3">Distribution Range</h4>
                    <div className="min-w-[300px] max-w-full">
                      <RangeIndicator
                        min={analysis.stats.min}
                        q25={analysis.stats.q25}
                        q50={analysis.stats.q50}
                        q75={analysis.stats.q75}
                        max={analysis.stats.max}
                        outlierCount={analysis.stats.boxPlot?.outliers.length || 0}
                        width={Math.min(400, (typeof window !== 'undefined' ? window.innerWidth : 400) - 120)}
                        height={120}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border-default my-3" />

                  {/* Missing data */}
                  <StatRowWithInsight
                    label="Missing"
                    value={`${missingCount.toLocaleString()} (${((missingCount / totalRows) * 100).toFixed(1)}%)`}
                    insight={missingInsight}
                  />

                  {/* Normality Test */}
                  {analysis.stats.normalityTest && (
                    <>
                      <div className="border-t border-border-default my-3" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary font-medium">Normality Test</span>
                          <span className="text-text-tertiary text-[10px]">{analysis.stats.normalityTest.test}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary">p-value</span>
                          <span className="text-xs font-mono text-text-primary">{analysis.stats.normalityTest.pValue.toFixed(4)}</span>
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          analysis.stats.normalityTest.isNormal
                            ? 'bg-success-bg border-success-border'
                            : 'bg-warning-bg border-warning-border'
                        }`}>
                          <div className="flex items-center gap-2">
                            {analysis.stats.normalityTest.isNormal ? (
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-warning-text flex-shrink-0" />
                            )}
                            <p className={`text-xs ${
                              analysis.stats.normalityTest.isNormal ? 'text-success' : 'text-warning-text'
                            }`}>
                              {analysis.stats.normalityTest.isNormal
                                ? 'Distribution appears normal (p > 0.05)'
                                : 'Distribution deviates from normal (p < 0.05)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {type === 'categorical' && (
                <>
                  <StatRow label="Unique Values" value={analysis.stats.uniqueCount.toLocaleString()} />
                  <StatRow label="Total Count" value={totalRows.toLocaleString()} />
                  <div className="border-t border-border-default my-2" />
                  <StatRowWithInsight
                    label="Missing"
                    value={`${missingCount.toLocaleString()} (${((missingCount / totalRows) * 100).toFixed(1)}%)`}
                    insight={missingInsight}
                  />
                </>
              )}

              {type === 'datetime' && (
                <>
                  <StatRow label="Unique Dates" value={analysis.stats.uniqueCount.toLocaleString()} />
                  <StatRow label="Min Date" value={analysis.stats.minDate || 'N/A'} />
                  <StatRow label="Max Date" value={analysis.stats.maxDate || 'N/A'} />
                  <div className="border-t border-border-default my-2" />
                  <StatRowWithInsight
                    label="Missing"
                    value={`${missingCount.toLocaleString()} (${((missingCount / totalRows) * 100).toFixed(1)}%)`}
                    insight={missingInsight}
                  />
                </>
              )}
            </div>
          </section>

          {/* Distribution Section (Numeric only) */}
          {type === 'numeric' && analysis.stats.histogram && (
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Distribution</h3>

              {/* Histogram with shape curve */}
              <div className="bg-bg-page rounded-lg p-4 overflow-x-auto">
                <div className="min-w-[300px] max-w-full">
                  <Histogram
                    bins={analysis.stats.histogram.bins}
                    counts={analysis.stats.histogram.counts}
                    stats={analysis.stats}
                    width={Math.min(400, (typeof window !== 'undefined' ? window.innerWidth : 400) - 120)}
                    height={200}
                    shapeLabel={distributionShape}
                  />
                </div>
              </div>

              {/* Box Plot for outlier visualization */}
              {analysis.stats.boxPlot && (
                <div className="mt-6 bg-bg-page rounded-lg p-4 overflow-x-auto">
                  <div className="min-w-[340px] max-w-full">
                    <BoxPlotVisualization
                      stats={analysis.stats}
                      columnName={columnName}
                      width={Math.min(400, (typeof window !== 'undefined' ? window.innerWidth : 400) - 120)}
                      height={300}
                    />
                  </div>
                </div>
              )}
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

          {/* Time Series Section (DateTime only) */}
          {type === 'datetime' && result.timeSeriesAnalysis && result.timeSeriesAnalysis.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Time Series Analysis</h3>
              {result.timeSeriesAnalysis
                .filter(ts => ts.dateColumn === columnName)
                .map((ts, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h4 className="text-xs font-medium text-text-secondary mb-3">
                      {columnName} × {ts.valueColumn}
                    </h4>
                    <div className="bg-bg-page rounded-lg p-4 overflow-x-auto">
                      <div className="min-w-[500px] max-w-full">
                        <TimeSeriesPlot
                          dates={ts.dates}
                          values={ts.values}
                          columnName={ts.valueColumn}
                          seasonality={ts}
                          width={Math.min(600, (typeof window !== 'undefined' ? window.innerWidth : 600) - 140)}
                          height={250}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </section>
          )}

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

// Helper component for stat rows with insight badges
function StatRowWithInsight({
  label,
  value,
  insight,
}: {
  label: string;
  value: string;
  insight?: { icon: React.ComponentType<{ className?: string }>; color: string; label: string; detail?: string } | null;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-text-primary font-medium font-mono">{value}</span>
        {insight && (
          <div className={`flex items-center gap-1 ${insight.color}`}>
            <insight.icon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{insight.label}</span>
            {insight.detail && <span className="text-xs opacity-70">({insight.detail})</span>}
          </div>
        )}
      </div>
    </div>
  );
}
