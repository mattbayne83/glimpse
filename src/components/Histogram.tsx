interface HistogramProps {
  bins: number[];
  counts: number[];
  width?: number;
  height?: number;
  shapeLabel?: string;
}

export function Histogram({ bins, counts, width = 300, height = 200, shapeLabel }: HistogramProps) {
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

  // Generate smooth curve using a simplified smoothing approach
  const generateCurvePath = (): string => {
    if (counts.length < 2) return '';

    // Create points at bar tops
    const points = counts.map((count, i) => {
      const normalizedHeight = (count / yAxisMax) * chartHeight;
      const x = leftPadding + i * barWidth + barWidth / 2;
      const y = topPadding + chartHeight - normalizedHeight;
      return { x, y };
    });

    // Add phantom points at the edges at baseline for smooth curve endpoints
    const baselineY = topPadding + chartHeight;
    const pStart = { x: leftPadding, y: baselineY };
    const pEnd = { x: leftPadding + chartWidth, y: baselineY };
    
    const extendedPoints = [pStart, ...points, pEnd];

    // Simple Catmull-Rom with tension to prevent overshooting baseline
    let path = `M ${extendedPoints[0].x} ${extendedPoints[0].y}`;

    for (let i = 0; i < extendedPoints.length - 1; i++) {
      const p0 = extendedPoints[Math.max(i - 1, 0)];
      const p1 = extendedPoints[i];
      const p2 = extendedPoints[i + 1];
      const p3 = extendedPoints[Math.min(i + 2, extendedPoints.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = Math.min(baselineY, p1.y + (p2.y - p0.y) / 6);
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = Math.min(baselineY, p2.y - (p3.y - p1.y) / 6);

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const curvePath = generateCurvePath();

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
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
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

        {/* Distribution curve glow/fill */}
        {curvePath && (
          <path
            d={`${curvePath} L ${leftPadding + chartWidth} ${topPadding + chartHeight} L ${leftPadding} ${topPadding + chartHeight} Z`}
            fill="url(#curveFill)"
            className="text-secondary"
          />
        )}

        {/* Distribution curve overlay */}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-text-primary"
            opacity="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
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

      {/* Shape label - enhanced badge */}
      {shapeLabel && (
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-bg-surface/80 backdrop-blur shadow-sm border border-border-default rounded-full text-[10px] font-bold tracking-wider uppercase text-text-secondary">
          {shapeLabel}
        </div>
      )}
    </div>
  );
}
