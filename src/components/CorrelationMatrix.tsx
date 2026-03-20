import type { CorrelationMatrix as CorrelationMatrixData } from '../types/analysis';
import { useThemeColors } from '../hooks/useThemeColors';

interface CorrelationMatrixProps {
  data: CorrelationMatrixData;
}

/**
 * Visualize correlation matrix as a heatmap.
 * Correlations range from -1 (negative) to +1 (positive).
 */
export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const { columns, matrix } = data;

  // Get current theme colors
  const colors = useThemeColors();
  const negativeColorHex = colors.correlationNegative;
  const positiveColorHex = colors.correlationPositive;
  const grayColorHex = colors.bgHover;

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 241, g: 245, b: 249 }; // fallback to slate-100
  };

  const negativeRgb = hexToRgb(negativeColorHex);
  const positiveRgb = hexToRgb(positiveColorHex);

  // Color scale: -1 (blue) → 0 (white) → +1 (red)
  const getColor = (value: number): string => {
    if (isNaN(value)) return grayColorHex;

    // Interpolate between correlation colors (-1) → white (0) → (+1)
    if (value < 0) {
      // Negative: correlation color to white
      const intensity = Math.abs(value);
      const r = Math.round(255 - intensity * (255 - negativeRgb.r));
      const g = Math.round(255 - intensity * (255 - negativeRgb.g));
      const b = Math.round(255 - intensity * (255 - negativeRgb.b));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Positive: white to correlation color
      const intensity = value;
      const r = Math.round(255 - intensity * (255 - positiveRgb.r));
      const g = Math.round(255 - intensity * (255 - positiveRgb.g));
      const b = Math.round(255 - intensity * (255 - positiveRgb.b));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Cell size calculation - smaller on mobile
  const baseCellSize = Math.max(60, Math.min(100, 600 / columns.length));
  const mobileCellSize = Math.max(48, Math.min(80, 400 / columns.length));
  const fontSize = baseCellSize > 80 ? 'text-xs' : 'text-[10px]';

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
      <div className="inline-block min-w-full">
        {/* Legend */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-12 h-4 rounded" style={{ background: `linear-gradient(to right, ${negativeColorHex}, #FFFFFF, ${positiveColorHex})` }} />
            <span>-1 (negative) → 0 → +1 (positive)</span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div
          className="grid border border-border-default rounded-lg overflow-hidden bg-bg-surface shadow-sm"
          style={{
            gridTemplateColumns: `auto repeat(${columns.length}, var(--cell-size, ${baseCellSize}px))`,
            gridTemplateRows: `auto repeat(${columns.length}, var(--cell-size, ${baseCellSize}px))`,
            ['--cell-size' as string]: window.innerWidth < 768 ? `${mobileCellSize}px` : `${baseCellSize}px`,
          }}
        >
          {/* Top-left corner (empty) */}
          <div className="bg-bg-page border-b border-r border-border-default" />

          {/* Column headers */}
          {columns.map((col, i) => {
            const borderColor = colors.borderDefault;
            return (
              <div
                key={`col-header-${i}`}
                className="bg-bg-page border-b border-border-default flex items-center justify-center p-1 last:border-r-0"
                style={{ borderRight: i < columns.length - 1 ? `1px solid ${borderColor}` : 'none' }}
              >
                <span
                  className={`${fontSize} font-medium text-text-secondary font-mono truncate text-center`}
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
            );
          })}

          {/* Row headers + cells */}
          {matrix.map((row, i) => {
            const borderColor = colors.borderDefault;
            const primaryColor = colors.primary;

            return (
              <div key={`row-${i}`} className="contents">
                {/* Row header */}
                <div
                  className="bg-bg-page border-r border-border-default flex items-center px-2 py-1 last:border-b-0"
                  style={{ borderBottom: i < matrix.length - 1 ? `1px solid ${borderColor}` : 'none' }}
                >
                  <span
                    className={`${fontSize} font-medium text-text-secondary font-mono truncate`}
                    title={columns[i]}
                  >
                    {columns[i]}
                  </span>
                </div>

                {/* Data cells */}
                {row.map((value, j) => (
                  <div
                    key={`cell-${i}-${j}`}
                    className="relative flex items-center justify-center p-1 transition-all duration-150 hover:ring-2 hover:ring-inset hover:z-10 cursor-help"
                    style={{
                      backgroundColor: getColor(value),
                      borderRight: j < row.length - 1 ? `1px solid ${borderColor}` : 'none',
                      borderBottom: i < matrix.length - 1 ? `1px solid ${borderColor}` : 'none',
                      '--tw-ring-color': primaryColor,
                    } as React.CSSProperties}
                    title={`${columns[i]} × ${columns[j]}: ${value.toFixed(3)}`}
                  >
                    <span
                      className={`${fontSize} font-mono font-medium ${
                        Math.abs(value) > 0.7 ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 bg-bg-page rounded-lg text-sm text-text-secondary">
          <p className="font-medium mb-1">💡 Interpreting Correlations</p>
          <ul className="space-y-1 text-xs text-text-secondary">
            <li>• <strong className="text-text-primary">±0.7-1.0:</strong> Strong correlation (red/blue)</li>
            <li>• <strong className="text-text-primary">±0.4-0.7:</strong> Moderate correlation</li>
            <li>• <strong className="text-text-primary">±0.0-0.4:</strong> Weak correlation (white)</li>
            <li>• Diagonal is always 1.0 (perfect self-correlation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
