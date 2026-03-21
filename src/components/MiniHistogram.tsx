interface MiniHistogramProps {
  bins: number[];
  counts: number[];
  width?: number;
  height?: number;
}

/**
 * Minimal sparkline-style histogram for quick visual comparison.
 * No axes, no labels - just the shape.
 */
export function MiniHistogram({ bins, counts, width = 200, height = 24 }: MiniHistogramProps) {
  if (bins.length === 0 || counts.length === 0) {
    return (
      <div
        className="bg-bg-hover rounded"
        style={{ width, height }}
      />
    );
  }

  const maxCount = Math.max(...counts);
  const barWidth = width / bins.length;
  const padding = 2;

  // Read secondary color from CSS variables for theme support
  const fillColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-secondary')
    .trim();

  return (
    <svg width={width} height={height} className="rounded">
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.8} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      {counts.map((count, i) => {
        const barHeight = Math.max((count / maxCount) * (height - padding * 2), 2); // Minimum 2px height
        const x = i * barWidth;
        const y = height - barHeight - padding;

        return (
          <rect
            key={i}
            x={x + 0.5}
            y={y}
            width={Math.max(barWidth - 1, 1)}
            height={barHeight}
            rx={2}
            ry={2}
            fill="url(#bar-grad)"
          />
        );
      })}
    </svg>
  );
}
