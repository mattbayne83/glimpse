import { useState } from 'react';
import type { ColumnAnalysis } from '../types/analysis';

interface ColumnMapProps {
  columns: ColumnAnalysis[];
  totalRows: number;
}

const TYPE_COLORS = {
  numeric: '#3b82f6', // blue
  categorical: '#10b981', // green
  datetime: '#8b5cf6', // purple
};

export function ColumnMap({ columns, totalRows }: ColumnMapProps) {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const maxBarHeight = 120;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Column Structure</h3>

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
            >
              {/* Bar */}
              <div
                className="w-full rounded-t transition-all"
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
                    backgroundColor: '#e5e7eb',
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none">
                  <div className="font-medium">{col.name}</div>
                  <div className="text-gray-300">
                    {col.analysis.type} · {completeness.toFixed(1)}% complete
                  </div>
                  {missingCount > 0 && (
                    <div className="text-gray-300">{missingCount} missing</div>
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
          <span className="text-gray-600">Numeric</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: TYPE_COLORS.categorical }}
          />
          <span className="text-gray-600">Categorical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: TYPE_COLORS.datetime }} />
          <span className="text-gray-600">DateTime</span>
        </div>
      </div>
    </div>
  );
}
