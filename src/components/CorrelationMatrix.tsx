import type { CorrelationMatrix as CorrelationMatrixData } from '../types/analysis';

interface CorrelationMatrixProps {
  data: CorrelationMatrixData;
}

/**
 * Visualize correlation matrix as a heatmap.
 * Correlations range from -1 (negative) to +1 (positive).
 */
export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const { columns, matrix } = data;

  // Color scale: -1 (blue) → 0 (white) → +1 (red)
  const getColor = (value: number): string => {
    if (isNaN(value)) return '#F1F5F9'; // gray for NaN

    // Interpolate between blue (-1), white (0), and red (+1)
    if (value < 0) {
      // Negative: blue to white
      const intensity = Math.abs(value);
      const r = Math.round(255 - intensity * 89); // 255 → 166
      const g = Math.round(255 - intensity * 33); // 255 → 222
      const b = 255; // always 255
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Positive: white to red
      const intensity = value;
      const r = 255; // always 255
      const g = Math.round(255 - intensity * 89); // 255 → 166
      const b = Math.round(255 - intensity * 89); // 255 → 166
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Cell size calculation
  const cellSize = Math.max(60, Math.min(100, 600 / columns.length));
  const fontSize = cellSize > 80 ? 'text-xs' : 'text-[10px]';

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Legend */}
        <div className="mb-4 flex items-center gap-4 text-sm text-[#64748B]">
          <div className="flex items-center gap-2">
            <div className="w-12 h-4 rounded" style={{ background: 'linear-gradient(to right, #A6DEFF, #FFFFFF, #FFA6A6)' }} />
            <span>-1 (negative) → 0 → +1 (positive)</span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div
          className="grid border border-[#E2E8F0] rounded-lg overflow-hidden bg-white shadow-sm"
          style={{
            gridTemplateColumns: `auto repeat(${columns.length}, ${cellSize}px)`,
            gridTemplateRows: `auto repeat(${columns.length}, ${cellSize}px)`,
          }}
        >
          {/* Top-left corner (empty) */}
          <div className="bg-[#F8FAFC] border-b border-r border-[#E2E8F0]" />

          {/* Column headers */}
          {columns.map((col, i) => (
            <div
              key={`col-header-${i}`}
              className="bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-center p-1 last:border-r-0"
              style={{ borderRight: i < columns.length - 1 ? '1px solid #E2E8F0' : 'none' }}
            >
              <span
                className={`${fontSize} font-medium text-[#475569] font-mono truncate text-center`}
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  maxWidth: '100%',
                }}
                title={col}
              >
                {col}
              </span>
            </div>
          ))}

          {/* Row headers + cells */}
          {matrix.map((row, i) => (
            <div key={`row-${i}`} className="contents">
              {/* Row header */}
              <div
                className="bg-[#F8FAFC] border-r border-[#E2E8F0] flex items-center px-2 py-1 last:border-b-0"
                style={{ borderBottom: i < matrix.length - 1 ? '1px solid #E2E8F0' : 'none' }}
              >
                <span
                  className={`${fontSize} font-medium text-[#475569] font-mono truncate`}
                  title={columns[i]}
                >
                  {columns[i]}
                </span>
              </div>

              {/* Data cells */}
              {row.map((value, j) => (
                <div
                  key={`cell-${i}-${j}`}
                  className="relative flex items-center justify-center p-1 transition-all duration-150 hover:ring-2 hover:ring-[#0066CC] hover:ring-inset hover:z-10 cursor-help"
                  style={{
                    backgroundColor: getColor(value),
                    borderRight: j < row.length - 1 ? '1px solid #E2E8F0' : 'none',
                    borderBottom: i < matrix.length - 1 ? '1px solid #E2E8F0' : 'none',
                  }}
                  title={`${columns[i]} × ${columns[j]}: ${value.toFixed(3)}`}
                >
                  <span
                    className={`${fontSize} font-mono font-medium ${
                      Math.abs(value) > 0.7 ? 'text-[#0F172A]' : 'text-[#475569]'
                    }`}
                  >
                    {value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 bg-[#F8FAFC] rounded-lg text-sm text-[#475569]">
          <p className="font-medium mb-1">💡 Interpreting Correlations</p>
          <ul className="space-y-1 text-xs text-[#64748B]">
            <li>• <strong className="text-[#0F172A]">±0.7-1.0:</strong> Strong correlation (red/blue)</li>
            <li>• <strong className="text-[#0F172A]">±0.4-0.7:</strong> Moderate correlation</li>
            <li>• <strong className="text-[#0F172A]">±0.0-0.4:</strong> Weak correlation (white)</li>
            <li>• Diagonal is always 1.0 (perfect self-correlation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
