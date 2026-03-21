import { ChevronRight, Hash, CaseSensitive, CalendarClock } from 'lucide-react';
import type { ColumnAnalysis } from '../types/analysis';
import { MiniHistogram } from './MiniHistogram';
import { DateRangeViz } from './DateRangeViz';

interface ColumnPreviewCardProps {
  column: ColumnAnalysis;
  totalRows: number;
  onClick: () => void;
}

export function ColumnPreviewCard({ column, totalRows, onClick }: ColumnPreviewCardProps) {
  const { name, analysis } = column;
  const type = analysis.type;

  // Type badge colors
  const typeColors = {
    numeric: 'bg-secondary-light text-secondary',
    categorical: 'bg-primary-light text-primary',
    datetime: 'bg-warning-bg text-warning-text',
  };

  const missingCount = analysis.stats.missing || 0;
  const missingPct = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="group relative glass-card rounded-2xl cursor-pointer hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Header - Compact */}
      <div className="px-4 py-3 border-b border-border-default bg-bg-hover/50">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-text-primary font-mono truncate flex-1 tracking-tight" title={name}>
            {name}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Normality Badge (for numeric columns only) */}
            {type === 'numeric' && analysis.stats.normalityTest && (
              <span
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider shadow-sm ${
                  analysis.stats.normalityTest.isNormal
                    ? 'bg-success-bg text-success border border-success-border'
                    : 'bg-warning-bg text-warning-text border border-warning-border'
                }`}
                title={`${analysis.stats.normalityTest.test}: p=${analysis.stats.normalityTest.pValue.toFixed(4)} ${
                  analysis.stats.normalityTest.isNormal ? '(Normal)' : '(Non-normal)'
                }`}
              >
                {analysis.stats.normalityTest.isNormal ? '✓' : '!'}
              </span>
            )}
            {/* Type Badge */}
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-lg ${typeColors[type]} shadow-sm`}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              {type === 'numeric' && <Hash className="w-3.5 h-3.5" />}
              {type === 'categorical' && <CaseSensitive className="w-3.5 h-3.5" />}
              {type === 'datetime' && <CalendarClock className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Area - Larger, more prominent */}
      <div className="p-3 bg-bg-page">
        {type === 'numeric' && analysis.stats.histogram && (
          <MiniHistogram
            bins={analysis.stats.histogram.bins}
            counts={analysis.stats.histogram.counts}
            width={200}
            height={56}
          />
        )}

        {type === 'categorical' && (
          <CategoricalViz stats={analysis.stats} />
        )}

        {type === 'datetime' && (
          <DateRangeViz
            stats={analysis.stats}
            width={200}
            height={56}
          />
        )}
      </div>

      {/* Stats Grid - Compact key metrics */}
      <div className="px-3 py-2.5 bg-bg-surface">
        {type === 'numeric' && (
          <NumericStats stats={analysis.stats} missingPct={missingPct} />
        )}

        {type === 'categorical' && (
          <CategoricalStats stats={analysis.stats} missingPct={missingPct} />
        )}

        {type === 'datetime' && (
          <DateTimeStats stats={analysis.stats} missingPct={missingPct} />
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
}

// Compact numeric stats grid
function NumericStats({ stats, missingPct }: { stats: { mean?: number; std?: number; min?: number; max?: number; q50?: number }; missingPct: number }) {
  const formatNum = (val: number | undefined) => {
    if (val === undefined) return 'N/A';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + 'k';
    if (Math.abs(val) < 1 && val !== 0) return val.toFixed(2);
    return val.toFixed(1);
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
      <StatItem label="Mean" value={formatNum(stats.mean)} />
      <StatItem label="Median" value={formatNum(stats.q50)} />
      <StatItem label="Min" value={formatNum(stats.min)} />
      <StatItem label="Max" value={formatNum(stats.max)} />
      <StatItem label="Std Dev" value={formatNum(stats.std)} />
      <StatItem
        label="Missing"
        value={`${missingPct.toFixed(1)}%`}
        valueColor={missingPct > 0 ? 'text-warning' : 'text-success'}
      />
    </div>
  );
}

// Categorical visualization - horizontal bars
function CategoricalViz({ stats }: { stats: { topValues?: Array<{ value: string; percentage: number }> } }) {
  const topValues = stats.topValues?.slice(0, 3) || [];
  const maxPct = topValues[0]?.percentage || 100;

  return (
    <div className="space-y-2">
      {topValues.map((item, idx) => (
        <div key={idx} className="space-y-0.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-text-primary truncate flex-1 mr-1" title={item.value}>
              {item.value.length > 12 ? item.value.slice(0, 12) + '...' : item.value}
            </span>
            <span className="text-primary font-semibold flex-shrink-0">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-border-default rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(item.percentage / maxPct) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {topValues.length === 0 && (
        <div className="h-14 flex items-center justify-center text-xs text-text-tertiary italic">
          No values
        </div>
      )}
    </div>
  );
}

// Compact categorical stats
function CategoricalStats({ stats, missingPct }: { stats: { uniqueCount: number; topValues?: Array<{ value: string; percentage: number }> }; missingPct: number }) {
  const topValue = stats.topValues?.[0];

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
      <StatItem label="Unique" value={stats.uniqueCount.toLocaleString()} />
      <StatItem
        label="Missing"
        value={`${missingPct.toFixed(1)}%`}
        valueColor={missingPct > 0 ? 'text-warning' : 'text-success'}
      />
      {topValue && (
        <>
          <div className="col-span-2">
            <StatItem
              label="Most Common"
              value={topValue.value.length > 15 ? topValue.value.slice(0, 15) + '...' : topValue.value}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Compact datetime stats
function DateTimeStats({ stats, missingPct }: { stats: { uniqueCount: number; minDate?: string; maxDate?: string }; missingPct: number }) {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return date.split(' ')[0]; // Just the date part, not time
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
      <StatItem label="Unique" value={stats.uniqueCount.toLocaleString()} />
      <StatItem
        label="Missing"
        value={`${missingPct.toFixed(1)}%`}
        valueColor={missingPct > 0 ? 'text-warning' : 'text-success'}
      />
      <StatItem label="Min Date" value={formatDate(stats.minDate)} />
      <StatItem label="Max Date" value={formatDate(stats.maxDate)} />
    </div>
  );
}

// Reusable stat item component
function StatItem({ label, value, valueColor = 'text-text-primary' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div className="text-text-tertiary uppercase tracking-wide mb-0.5">{label}</div>
      <div className={`font-semibold font-mono ${valueColor} truncate`} title={value}>
        {value}
      </div>
    </div>
  );
}
