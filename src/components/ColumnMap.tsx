import { useState } from 'react';
import type { ColumnAnalysis } from '../types/analysis';
import { Hash, CaseSensitive, CalendarClock } from 'lucide-react';

interface ColumnMapProps {
  columns: ColumnAnalysis[];
  totalRows: number;
  onColumnClick?: (columnName: string) => void;
}

export function ColumnMap({ columns, totalRows, onColumnClick }: ColumnMapProps) {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const maxBarHeight = 120;

  // Read colors from CSS variables for theme support
  const TYPE_COLORS = {
    numeric: getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim(),
    categorical: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    datetime: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
  };

  const TYPE_ICONS = {
    numeric: Hash,
    categorical: CaseSensitive,
    datetime: CalendarClock,
  };

  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border-default').trim();

  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-text-primary mb-3">Column Structure</h3>

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
                    backgroundColor: borderColor,
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bg-elevated text-text-primary text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-xl border border-border-default">
                  <div className="flex items-center gap-1.5 font-medium font-mono mb-1">
                    {(() => {
                      const Icon = TYPE_ICONS[col.analysis.type];
                      return <Icon className="w-3.5 h-3.5" style={{ color }} />;
                    })()}
                    {col.name}
                  </div>
                  <div className="text-text-secondary ml-5">
                    {col.analysis.type} · {completeness.toFixed(1)}% complete
                  </div>
                  {missingCount > 0 && (
                    <div className="text-text-secondary ml-5">{missingCount} missing</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 rounded opacity-80" style={{ backgroundColor: TYPE_COLORS.numeric }}>
            <Hash className="w-3.5 h-3.5 text-bg-surface" />
          </div>
          <span className="text-text-secondary font-medium">Numeric</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 rounded opacity-80" style={{ backgroundColor: TYPE_COLORS.categorical }}>
            <CaseSensitive className="w-3.5 h-3.5 text-bg-surface" />
          </div>
          <span className="text-text-secondary font-medium">Categorical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 rounded opacity-80" style={{ backgroundColor: TYPE_COLORS.datetime }}>
            <CalendarClock className="w-3.5 h-3.5 text-bg-surface" />
          </div>
          <span className="text-text-secondary font-medium">DateTime</span>
        </div>
      </div>
    </div>
  );
}
