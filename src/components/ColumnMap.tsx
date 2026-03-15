import { useState } from 'react';
import type { ColumnAnalysis } from '../types/analysis';

interface ColumnMapProps {
  columns: ColumnAnalysis[];
  totalRows: number;
  onColumnClick?: (columnName: string) => void;
}

const TYPE_COLORS = {
  numeric: '#0D9488', // Analysis Teal
  categorical: '#0066CC', // Insight Blue
  datetime: '#64748B', // Privacy Slate
};

export function ColumnMap({ columns, totalRows, onColumnClick }: ColumnMapProps) {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const maxBarHeight = 120;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-[#334155] mb-3">Column Structure</h3>

      <div className="flex items-end gap-1 mb-2" style={{ height: maxBarHeight + 20 }}>
        {columns.map((col) => {
          const missingCount =
            col.analysis.type === 'numeric'
              ? col.analysis.stats.missing
              : col.analysis.type === 'categorical'
              ? col.analysis.stats.missing
              : col.analysis.stats.missing;

          const completeness = totalRows > 0 ? ((totalRows - missingCount) / totalRows) * 100 : 100;
          const barHeight = (completeness / 100) * maxBarHeight;

          const color = TYPE_COLORS[col.analysis.type];
          const isHovered = hoveredColumn === col.name;

          return (
            <div
              key={col.name}
              className="flex-1 relative group cursor-pointer"
              onMouseEnter={() => setHoveredColumn(col.name)}
              onMouseLeave={() => setHoveredColumn(null)}
              onClick={() => onColumnClick?.(col.name)}
            >
              {/* Bar */}
              <div
                className="w-full rounded-t transition-all duration-200"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.8,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />

              {/* Missing data gap (if any) */}
              {completeness < 100 && (
                <div
                  className="w-full"
                  style={{
                    height: `${maxBarHeight - barHeight}px`,
                    backgroundColor: '#E2E8F0',
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0F172A] text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                  <div className="font-medium font-mono">{col.name}</div>
                  <div className="text-[#CBD5E1]">
                    {col.analysis.type} · {completeness.toFixed(1)}% complete
                  </div>
                  {missingCount > 0 && (
                    <div className="text-[#CBD5E1]">{missingCount} missing</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: TYPE_COLORS.numeric }} />
          <span className="text-[#64748B]">Numeric</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: TYPE_COLORS.categorical }}
          />
          <span className="text-[#64748B]">Categorical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: TYPE_COLORS.datetime }} />
          <span className="text-[#64748B]">DateTime</span>
        </div>
      </div>
    </div>
  );
}
