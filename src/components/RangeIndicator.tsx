import { useThemeColors } from '../hooks/useThemeColors';

interface RangeIndicatorProps {
  min: number;
  q25: number;
  q50: number;
  q75: number;
  max: number;
  outlierCount?: number;
  width?: number;
  height?: number;
}

// Helper component for labels with connector lines (defined outside to avoid re-creation)
const LabelWithConnector = ({
  x,
  value,
  label,
  level,
  isPrimary = false,
  lineY,
  labelY,
  staggeringOffset,
  colors
}: {
  x: number;
  value: string;
  label: string;
  level: number;
  isPrimary?: boolean;
  lineY: number;
  labelY: number;
  staggeringOffset: number;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const yOffset = level * staggeringOffset;
  const textY = labelY + yOffset;
  const connectorYStart = lineY + (isPrimary ? 8 : 4);

  return (
    <g>
      {/* Connector line */}
      {level > 0 && (
        <line
          x1={x}
          y1={connectorYStart}
          x2={x}
          y2={textY - 10}
          stroke={isPrimary ? colors.primary : colors.borderDefault}
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={0.4}
        />
      )}

      {/* Value text */}
      <text
        x={x}
        y={textY}
        textAnchor="middle"
        className={`text-[10px] ${isPrimary ? 'fill-text-primary font-bold' : 'fill-text-secondary font-medium'}`}
      >
        {value}
      </text>

      {/* Label name */}
      <text
        x={x}
        y={textY + 10}
        textAnchor="middle"
        className="text-[8px] fill-text-tertiary font-medium opacity-70 uppercase tracking-tighter"
      >
        {label}
      </text>
    </g>
  );
};

export function RangeIndicator({
  min,
  q25,
  q50,
  q75,
  max,
  outlierCount = 0,
  width = 432,
  height = 120,
}: RangeIndicatorProps) {
  const colors = useThemeColors();

  // Layout constants
  const padding = { left: 48, right: 48, top: 32, bottom: 48 };
  const plotWidth = width - padding.left - padding.right;
  const lineY = padding.top + 15;

  // Calculate data range for scaling
  const range = max - min;

  // Avoid division by zero for constant columns
  const scale = (value: number) => {
    if (range === 0) return padding.left + plotWidth / 2;
    return padding.left + ((value - min) / range) * plotWidth;
  };

  // Format number for display
  const formatNumber = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else if (Math.abs(value) >= 100) {
      return value.toFixed(0);
    } else if (Math.abs(value) >= 1) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  };

  // Calculate positions
  const minX = scale(min);
  const q25X = scale(q25);
  const q50X = scale(q50);
  const q75X = scale(q75);
  const maxX = scale(max);
  const iqr = q75 - q25;

  const labelY = lineY + 15;
  const staggeringOffset = 18;

  return (
    <div className="relative group">
      <svg width={width} height={height} className="overflow-visible">
        {/* Main line (min to max) */}
        <line
          x1={minX}
          y1={lineY}
          x2={maxX}
          y2={lineY}
          stroke={colors.borderDefault}
          strokeWidth={2}
          opacity={0.5}
        />

        {/* IQR box (Q1 to Q3) - highlighted */}
        <rect
          x={q25X}
          y={lineY - 6}
          width={Math.max(q75X - q25X, 1)}
          height={12}
          fill={colors.primary}
          fillOpacity={0.15}
          stroke={colors.primary}
          strokeWidth={2}
          rx={2}
        />

        {/* Min marker */}
        <circle cx={minX} cy={lineY} r={4} fill={colors.borderDefault} className="stroke-bg-surface stroke-2" />

        {/* Q1 marker */}
        <line
          x1={q25X}
          y1={lineY - 10}
          x2={q25X}
          y2={lineY + 10}
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Median marker (prominent) */}
        <line
          x1={q50X}
          y1={lineY - 12}
          x2={q50X}
          y2={lineY + 12}
          stroke={colors.primary}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Q3 marker */}
        <line
          x1={q75X}
          y1={lineY - 10}
          x2={q75X}
          y2={lineY + 10}
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Max marker */}
        <circle cx={maxX} cy={lineY} r={4} fill={colors.borderDefault} className="stroke-bg-surface stroke-2" />

        {/* Outlier indicators (if any) */}
        {outlierCount > 0 && (
          <g>
            <circle
              cx={maxX + 14}
              cy={lineY}
              r={3.5}
              fill={colors.correlationPositive || '#f43f5e'}
              fillOpacity={0.4}
              className="stroke-bg-surface stroke-1"
            />
            <circle
              cx={maxX + 24}
              cy={lineY}
              r={3.5}
              fill={colors.correlationPositive || '#f43f5e'}
              fillOpacity={0.4}
              className="stroke-bg-surface stroke-1"
            />
          </g>
        )}

        {/* Staggered Labels */}
        <LabelWithConnector x={q50X} value={formatNumber(q50)} label="Median" level={0} isPrimary={true} lineY={lineY} labelY={labelY} staggeringOffset={staggeringOffset} colors={colors} />

        <LabelWithConnector x={q25X} value={formatNumber(q25)} label="Q1" level={1} lineY={lineY} labelY={labelY} staggeringOffset={staggeringOffset} colors={colors} />
        <LabelWithConnector x={q75X} value={formatNumber(q75)} label="Q3" level={1} lineY={lineY} labelY={labelY} staggeringOffset={staggeringOffset} colors={colors} />

        <LabelWithConnector x={minX} value={formatNumber(min)} label="Min" level={2} lineY={lineY} labelY={labelY} staggeringOffset={staggeringOffset} colors={colors} />
        <LabelWithConnector x={maxX} value={formatNumber(max)} label="Max" level={2} lineY={lineY} labelY={labelY} staggeringOffset={staggeringOffset} colors={colors} />
      </svg>

      {/* IQR info below - enhanced */}
      <div className="flex items-center justify-center gap-4 mt-8 px-4 py-2 bg-bg-page/50 rounded-lg border border-border-default/50">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest">IQR</span>
          <span className="text-sm font-semibold text-text-secondary">{formatNumber(iqr)}</span>
        </div>
        
        {outlierCount > 0 && (
          <>
            <div className="w-px h-6 bg-border-default/50" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest">Outliers</span>
              <span className="text-sm font-semibold text-rose-500">{outlierCount}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
