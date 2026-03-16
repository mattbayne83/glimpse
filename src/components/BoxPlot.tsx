import { useThemeColors } from '../hooks/useThemeColors';

interface BoxPlotProps {
  min: number;
  q25: number;
  q50: number;
  q75: number;
  max: number;
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
  width?: number;
  height?: number;
}

export function BoxPlot({
  min,
  q25,
  q50,
  q75,
  max,
  lowerWhisker,
  upperWhisker,
  outliers,
  width = 432,
  height = 140,
}: BoxPlotProps) {
  const colors = useThemeColors();

  // Layout constants
  const padding = { left: 50, right: 30, top: 30, bottom: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const boxCenterY = padding.top + plotHeight / 2;
  const boxHeight = 40;

  // Calculate data range for scaling
  const dataMin = Math.min(min, lowerWhisker, ...outliers);
  const dataMax = Math.max(max, upperWhisker, ...outliers);
  const range = dataMax - dataMin;

  // Avoid division by zero for constant columns
  const scale = (value: number) => {
    if (range === 0) return padding.left + plotWidth / 2;
    return padding.left + ((value - dataMin) / range) * plotWidth;
  };

  // Format number for display
  const formatNumber = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else if (Math.abs(value) >= 100) {
      return value.toFixed(0);
    } else {
      return value.toFixed(1);
    }
  };

  // Calculate positions
  const minX = scale(min);
  const q25X = scale(q25);
  const q50X = scale(q50);
  const q75X = scale(q75);
  const maxX = scale(max);
  const lowerWhiskerX = scale(lowerWhisker);
  const upperWhiskerX = scale(upperWhisker);

  return (
    <svg width={width} height={height} className="bg-bg-page border border-border-default rounded">
      {/* Lower whisker line (from lower whisker to Q1) */}
      <line
        x1={lowerWhiskerX}
        y1={boxCenterY}
        x2={q25X}
        y2={boxCenterY}
        stroke={colors.borderDefault}
        strokeWidth={1}
      />

      {/* Lower whisker cap */}
      <line
        x1={lowerWhiskerX}
        y1={boxCenterY - 8}
        x2={lowerWhiskerX}
        y2={boxCenterY + 8}
        stroke={colors.borderDefault}
        strokeWidth={1}
      />

      {/* Box (Q1 to Q3) */}
      <rect
        x={q25X}
        y={boxCenterY - boxHeight / 2}
        width={Math.max(q75X - q25X, 1)}
        height={boxHeight}
        fill={colors.primary}
        fillOpacity={0.3}
        stroke={colors.primary}
        strokeWidth={2}
      />

      {/* Median line (Q2) */}
      <line
        x1={q50X}
        y1={boxCenterY - boxHeight / 2}
        x2={q50X}
        y2={boxCenterY + boxHeight / 2}
        stroke={colors.primary}
        strokeWidth={3}
      />

      {/* Upper whisker line (from Q3 to upper whisker) */}
      <line
        x1={q75X}
        y1={boxCenterY}
        x2={upperWhiskerX}
        y2={boxCenterY}
        stroke={colors.borderDefault}
        strokeWidth={1}
      />

      {/* Upper whisker cap */}
      <line
        x1={upperWhiskerX}
        y1={boxCenterY - 8}
        x2={upperWhiskerX}
        y2={boxCenterY + 8}
        stroke={colors.borderDefault}
        strokeWidth={1}
      />

      {/* Outlier points with vertical jitter to avoid overlap */}
      {outliers.map((outlier, idx) => {
        const outlierX = scale(outlier);
        // Add vertical jitter based on index to spread overlapping points
        const jitterY = boxCenterY + ((idx % 5) - 2) * 4;
        return (
          <circle
            key={idx}
            cx={outlierX}
            cy={jitterY}
            r={3.5}
            fill={colors.correlationPositive}
            fillOpacity={0.6}
            stroke={colors.correlationPositive}
            strokeWidth={1}
          />
        );
      })}

      {/* Axis labels - simplified to key values */}
      <text
        x={minX}
        y={height - 12}
        textAnchor="middle"
        className="text-[10px] fill-text-tertiary"
      >
        {formatNumber(min)}
      </text>

      <text
        x={minX}
        y={height - 2}
        textAnchor="middle"
        className="text-[9px] fill-text-tertiary opacity-60"
      >
        Min
      </text>

      <text
        x={q50X}
        y={height - 12}
        textAnchor="middle"
        className="text-[11px] fill-text-primary font-semibold"
      >
        {formatNumber(q50)}
      </text>

      <text
        x={q50X}
        y={height - 2}
        textAnchor="middle"
        className="text-[9px] fill-text-secondary font-medium"
      >
        Median
      </text>

      <text
        x={maxX}
        y={height - 12}
        textAnchor="middle"
        className="text-[10px] fill-text-tertiary"
      >
        {formatNumber(max)}
      </text>

      <text
        x={maxX}
        y={height - 2}
        textAnchor="middle"
        className="text-[9px] fill-text-tertiary opacity-60"
      >
        Max
      </text>
    </svg>
  );
}
