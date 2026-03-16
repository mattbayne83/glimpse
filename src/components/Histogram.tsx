interface HistogramProps {
  bins: number[];
  counts: number[];
  width?: number;
  height?: number;
}

export function Histogram({ bins, counts, width = 300, height = 80 }: HistogramProps) {
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
  const barWidth = width / bins.length;
  const padding = 4;

  // Read secondary color from CSS variables for theme support
  const fillColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-secondary')
    .trim();

  return (
    <svg width={width} height={height} className="bg-bg-page border border-border-default rounded">
      {counts.map((count, i) => {
        const barHeight = (count / maxCount) * (height - padding * 2);
        const x = i * barWidth;
        const y = height - barHeight - padding;

        return (
          <rect
            key={i}
            x={x + 1}
            y={y}
            width={Math.max(barWidth - 2, 1)}
            height={barHeight}
            fill={fillColor}
            opacity={0.8}
            className="transition-opacity hover:opacity-100"
          />
        );
      })}
    </svg>
  );
}
