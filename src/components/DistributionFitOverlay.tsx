import { useMemo } from 'react';
import type { NumericColumnStats } from '../types/analysis';

interface DistributionFitOverlayProps {
  histogram: {
    bins: number[];
    counts: number[];
  };
  stats: NumericColumnStats;
  width?: number;
  height?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
}

/**
 * Overlays a theoretical normal distribution curve on a histogram.
 * Compares actual data distribution to an ideal normal distribution N(μ, σ).
 */
export function DistributionFitOverlay({
  histogram,
  stats,
  width = 400,
  height = 200,
  padding = { top: 48, right: 48, bottom: 48, left: 48 },
}: DistributionFitOverlayProps) {
  const { bins, counts } = histogram;
  const { mean, std } = stats;

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Calculate normal distribution curve points
  const normalCurve = useMemo(() => {
    // Check validity inside useMemo (hooks must always run)
    if (mean === undefined || std === undefined || std === 0) {
      return [];
    }

    const numPoints = 100;
    const minX = Math.min(...bins);
    const maxX = Math.max(...bins);
    const step = (maxX - minX) / (numPoints - 1);

    // Normal PDF: (1 / (σ√(2π))) * e^(-0.5 * ((x - μ) / σ)^2)
    const normalPDF = (x: number): number => {
      const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
      const exponent = -0.5 * Math.pow((x - mean) / std, 2);
      return coefficient * Math.exp(exponent);
    };

    // Generate points along the curve
    const points = Array.from({ length: numPoints }, (_, i) => {
      const x = minX + step * i;
      const y = normalPDF(x);
      return { x, y };
    });

    // Scale curve to match histogram height (approximate integral)
    const binWidth = bins[1] - bins[0];
    const totalCount = counts.reduce((sum, c) => sum + c, 0);
    const scaleFactor = totalCount * binWidth;

    return points.map(p => ({ x: p.x, y: p.y * scaleFactor }));
  }, [bins, counts, mean, std]);

  // Calculate scales
  const { xScale, yScale } = useMemo(() => {
    if (normalCurve.length === 0) {
      // Return stub functions if no curve
      return {
        xScale: () => 0,
        yScale: () => 0,
      };
    }

    const minX = Math.min(...bins);
    const maxX = Math.max(...bins);
    const maxCount = Math.max(...counts);
    const maxNormalY = Math.max(...normalCurve.map(p => p.y));
    const maxY = Math.max(maxCount, maxNormalY);

    const xScale = (value: number) =>
      ((value - minX) / (maxX - minX)) * plotWidth;

    const yScale = (value: number) =>
      plotHeight - (value / maxY) * plotHeight;

    return { xScale, yScale };
  }, [bins, counts, normalCurve, plotWidth, plotHeight]);

  // Generate SVG path for normal curve
  const normalPath = useMemo(() => {
    if (normalCurve.length === 0) {
      return '';
    }

    return normalCurve
      .map((point, i) => {
        const x = padding.left + xScale(point.x);
        const y = padding.top + yScale(point.y);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  }, [normalCurve, xScale, yScale, padding]);

  // Early return after all hooks (React rules)
  if (mean === undefined || std === undefined || std === 0 || normalPath === '') {
    return null;
  }

  return (
    <g>
      {/* Normal distribution curve (dashed orange line) */}
      <path
        d={normalPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4,4"
        className="text-warning"
        opacity="0.8"
      />
    </g>
  );
}
