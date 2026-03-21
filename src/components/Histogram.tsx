import type { NumericColumnStats } from '../types/analysis';
import { DistributionFitOverlay } from './DistributionFitOverlay';
import { Tooltip } from './Tooltip';
import { HelpCircle } from 'lucide-react';

interface HistogramProps {
  bins: number[];
  counts: number[];
  stats?: NumericColumnStats;
  width?: number;
  height?: number;
  shapeLabel?: string;
  shapeTooltip?: { term: string; content: string; example?: string };
}

export function Histogram({ bins, counts, stats, width = 300, height = 200, shapeLabel, shapeTooltip }: HistogramProps) {
  if (bins.length === 0 || counts.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-bg-page border border-border-default rounded text-xs text-text-tertiary"
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  const maxCount = Math.max(...counts);

  // Layout dimensions
  const leftPadding = 48; // Space for Y-axis labels
  const rightPadding = 48; // Balanced space (matches RangeIndicator)
  const topPadding = 40; // Balanced vertical space
  const bottomPadding = 40; // Space for X-axis labels

  const chartHeight = height - topPadding - bottomPadding;
  const chartWidth = width - leftPadding - rightPadding;
  const barWidth = chartWidth / bins.length;

  // Read secondary color from CSS variables for theme support
  const fillColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-secondary')
    .trim() || '#2dd4bf';

  // Calculate Y-axis scale (round up to nice number)
  const yAxisMax = Math.ceil(maxCount / 10) * 10 || 10;
  const yAxisSteps = 4; // Number of grid lines

  // Format axis labels
  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    if (Math.abs(value) < 1 && value !== 0) {
      return value.toFixed(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  // Calculate X-axis labels
  const numXLabels = Math.min(6, bins.length);
  const xLabelIndices = Array.from({ length: numXLabels }, (_, i) =>
    Math.floor((i * (bins.length - 1)) / (numXLabels - 1))
  );

  return (
    <div className="relative group">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
          const y = topPadding + (chartHeight * i) / yAxisSteps;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={leftPadding}
                y1={y}
                x2={leftPadding + chartWidth}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border-default"
                opacity="0.2"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}

        {/* Histogram bars (no gap for true histogram look) */}
        {counts.map((count, i) => {
          const normalizedHeight = (count / yAxisMax) * chartHeight;
          const x = leftPadding + i * barWidth;
          const y = topPadding + chartHeight - normalizedHeight;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth + 0.5} // Slight overlap to fix subpixel gaps
              height={normalizedHeight}
              fill="url(#barGradient)"
              className="transition-all duration-300 hover:brightness-110"
            />
          );
        })}

        {/* Normal distribution fit overlay */}
        {stats && (
          <DistributionFitOverlay
            histogram={{ bins, counts }}
            stats={stats}
            width={width}
            height={height}
            padding={{ top: topPadding, right: rightPadding, bottom: bottomPadding, left: leftPadding }}
          />
        )}

        {/* Y-axis labels */}
        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
          const value = yAxisMax - (yAxisMax * i) / yAxisSteps;
          const y = topPadding + (chartHeight * i) / yAxisSteps;
          return (
            <text
              key={`y-${i}`}
              x={leftPadding - 12}
              y={y + 4}
              fontSize="10"
              fontWeight="500"
              fill="currentColor"
              className="text-text-tertiary"
              textAnchor="end"
            >
              {Math.round(value)}
            </text>
          );
        })}

        {/* X-axis labels */}
        {xLabelIndices.map((binIndex) => {
          const x = leftPadding + binIndex * barWidth + barWidth / 2;
          return (
            <text
              key={`x-${binIndex}`}
              x={x}
              y={height - 10}
              fontSize="10"
              fontWeight="500"
              fill="currentColor"
              className="text-text-tertiary"
              textAnchor="middle"
            >
              {formatValue(bins[binIndex])}
            </text>
          );
        })}

        {/* X-axis baseline */}
        <line
          x1={leftPadding}
          y1={topPadding + chartHeight}
          x2={leftPadding + chartWidth}
          y2={topPadding + chartHeight}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-border-strong"
        />
      </svg>

      {/* Overlay controls layer */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-none">
        {/* Top Badges Row */}
        <div className="flex items-center gap-2 relative z-10">
          {/* P-value badge */}
          {stats?.normalityTest && (
            <div className={`px-2 py-1 rounded-md text-[10px] font-semibold border shadow-sm backdrop-blur pointer-events-auto ${
              stats.normalityTest.isNormal 
                ? 'bg-success-bg/90 text-success border-success-border/50' 
                : 'bg-warning-bg/90 text-warning-text border-warning-border/50'
            }`}>
              p = {stats.normalityTest.pValue.toFixed(3)}
            </div>
          )}
          
          {/* Shape label - enhanced badge */}
          {shapeLabel && (
            <div className="px-2.5 py-1 bg-bg-surface/90 backdrop-blur shadow-sm border border-border-default rounded-full flex items-center gap-1.5 pointer-events-auto">
              <span className="text-[10px] font-bold tracking-wider uppercase text-text-secondary">{shapeLabel}</span>
              {shapeTooltip && (
                <Tooltip {...shapeTooltip} align="right">
                  <HelpCircle className="w-3 h-3 text-text-tertiary hover:text-text-primary cursor-help transition-colors" />
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Legend (only if stats are present to show Normal Fit) */}
        {stats && (
          <div className="px-3 py-2 bg-bg-surface/90 backdrop-blur shadow-sm border border-border-default rounded-lg flex flex-col gap-1.5 pointer-events-auto relative z-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-secondary/60" />
              <span className="text-[10px] font-medium text-text-primary leading-none">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 border-t-2 border-dashed border-warning" />
              <span className="text-[10px] font-medium text-text-primary leading-none">Normal Fit</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
