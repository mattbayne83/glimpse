import { ChevronRight } from 'lucide-react';
import type { ColumnAnalysis } from '../types/analysis';
import { MiniHistogram } from './MiniHistogram';

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
    numeric: 'bg-[#DBEAFE] text-[#1E40AF]',
    categorical: 'bg-[#F3E8FF] text-[#6B21A8]',
    datetime: 'bg-[#FEF3C7] text-[#92400E]',
  };

  const missingCount = analysis.stats.missing || 0;
  const missingPct = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="group relative p-4 bg-white border border-[#E2E8F0] rounded-lg shadow-sm cursor-pointer hover:border-[#0066CC] hover:shadow-md transition-all duration-150"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#334155] font-mono truncate">{name}</h3>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${typeColors[type]}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#0066CC] transition-colors flex-shrink-0 ml-2" />
      </div>

      {/* Content - varies by type */}
      {type === 'numeric' && (
        <NumericPreview
          stats={analysis.stats}
          missingPct={missingPct}
        />
      )}

      {type === 'categorical' && (
        <CategoricalPreview
          stats={analysis.stats}
          missingPct={missingPct}
        />
      )}

      {type === 'datetime' && (
        <DateTimePreview
          stats={analysis.stats}
          missingPct={missingPct}
        />
      )}
    </div>
  );
}

// Numeric column preview
function NumericPreview({ stats, missingPct }: { stats: { mean?: number; min?: number; max?: number; histogram?: { bins: number[]; counts: number[] } }; missingPct: number }) {
  return (
    <div className="space-y-3">
      {/* Mini Histogram */}
      {stats.histogram && (
        <MiniHistogram
          bins={stats.histogram.bins}
          counts={stats.histogram.counts}
          width={240}
          height={28}
        />
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-[#64748B] block">Mean</span>
          <span className="font-medium text-[#0F172A] font-mono">
            {stats.mean?.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[#64748B] block">Range</span>
          <span className="font-medium text-[#0F172A] font-mono">
            {stats.min?.toFixed(1)}–{stats.max?.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-[#64748B] block">Missing</span>
          <span className={`font-medium font-mono ${missingPct > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
            {missingPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Categorical column preview
function CategoricalPreview({ stats, missingPct }: { stats: { uniqueCount: number; topValues?: Array<{ value: string; percentage: number }> }; missingPct: number }) {
  const topValues = stats.topValues?.slice(0, 2) || [];

  return (
    <div className="space-y-3">
      {/* Top Values */}
      <div className="space-y-1.5">
        {topValues.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-[#334155] truncate flex-1 mr-2">• {item.value}</span>
            <span className="text-[#0066CC] font-medium flex-shrink-0">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
        {topValues.length === 0 && (
          <p className="text-xs text-[#94A3B8] italic">No values</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0]">
        <span className="text-[#64748B]">{stats.uniqueCount} unique values</span>
        <span className={`font-medium ${missingPct > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
          Missing: {missingPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// DateTime column preview
function DateTimePreview({ stats, missingPct }: { stats: { uniqueCount: number; minDate?: string; maxDate?: string }; missingPct: number }) {
  return (
    <div className="space-y-3">
      {/* Date Range */}
      <div className="text-xs">
        <span className="text-[#64748B] block mb-1">Range</span>
        <div className="flex items-center gap-2 font-mono text-[#0F172A]">
          <span className="truncate">{stats.minDate || 'N/A'}</span>
          <span className="text-[#94A3B8]">→</span>
          <span className="truncate">{stats.maxDate || 'N/A'}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0]">
        <span className="text-[#64748B]">{stats.uniqueCount} unique dates</span>
        <span className={`font-medium ${missingPct > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
          Missing: {missingPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
