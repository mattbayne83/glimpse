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
      {counts.map((count, i) => {
        const barHeight = (count / maxCount) * (height - padding * 2);
        const x = i * barWidth;
        const y = height - barHeight - padding;

        return (
          <rect
            key={i}
            x={x + 0.5}
            y={y}
            width={Math.max(barWidth - 1, 1)}
            height={barHeight}
            fill={fillColor}
            opacity={0.7}
          />
        );
      })}
    </svg>
  );
}
