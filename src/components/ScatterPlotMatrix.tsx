import { useMemo } from 'react';
import type { CorrelationMatrix } from '../types/analysis';

interface ScatterPlotMatrixProps {
  columns: string[];
  correlation: CorrelationMatrix;
  rawData: Record<string, number[]>; // column name -> array of values
  width?: number;
}

/**
 * Scatter plot matrix (SPLOM) for exploring relationships between numeric columns.
 * Upper triangle: scatter plots, diagonal: column names, lower triangle: correlation values.
 * Limited to 6×6 grid to maintain performance.
 */
export function ScatterPlotMatrix({
  columns: allColumns,
  correlation,
  rawData,
  width = 800,
}: ScatterPlotMatrixProps) {
  // Limit to top 6 columns by correlation strength
  const columns = useMemo(() => {
    if (allColumns.length <= 6) return allColumns;

    // Calculate average absolute correlation for each column
    const avgCorrelations = allColumns.map((col, i) => {
      const colIndex = correlation.columns.indexOf(col);
      if (colIndex === -1) return { col, avg: 0 };

      const correlations = correlation.matrix[colIndex];
      const avgAbsCorr =
        correlations.reduce((sum, r, j) => (i !== j ? sum + Math.abs(r) : sum), 0) /
        (correlations.length - 1);

      return { col, avg: avgAbsCorr };
    });

    // Sort by average correlation (descending) and take top 6
    return avgCorrelations
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6)
      .map(x => x.col);
  }, [allColumns, correlation]);

  const n = columns.length;
  const cellSize = Math.min(Math.floor(width / n), 120); // Max 120px per cell
  const totalSize = cellSize * n;
  const padding = 40;

  // Helper to get correlation value between two columns
  const getCorrelation = (col1: string, col2: string): number => {
    const i = correlation.columns.indexOf(col1);
    const j = correlation.columns.indexOf(col2);
    if (i === -1 || j === -1) return 0;
    return correlation.matrix[i][j];
  };

  // Helper to format correlation value
  const formatCorr = (r: number): string => {
    return r.toFixed(2);
  };

  // Helper to get correlation color
  const getCorrColor = (r: number): string => {
    const absR = Math.abs(r);
    if (absR >= 0.7) return r > 0 ? 'text-primary' : 'text-error';
    if (absR >= 0.4) return r > 0 ? 'text-primary/70' : 'text-error/70';
    return 'text-text-tertiary';
  };

  if (n < 2) {
    return (
      <div className="p-8 text-center text-sm text-text-tertiary italic">
        Need at least 2 numeric columns for scatter plot matrix
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={totalSize + padding * 2}
        height={totalSize + padding * 2}
        className="mx-auto"
        style={{ maxWidth: '100%' }}
      >
        {/* Grid cells */}
        {columns.map((rowCol, i) => {
          return columns.map((colCol, j) => {
            const x = padding + j * cellSize;
            const y = padding + i * cellSize;

            // Diagonal: Column name labels
            if (i === j) {
              return (
                <g key={`${i}-${j}`}>
                  {/* Background */}
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill="currentColor"
                    className="text-bg-hover"
                  />
                  {/* Column name */}
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold text-text-primary fill-current"
                  >
                    {rowCol.length > 12 ? rowCol.slice(0, 10) + '...' : rowCol}
                  </text>
                </g>
              );
            }

            // Upper triangle: Scatter plots
            if (i < j) {
              return (
                <ScatterCell
                  key={`${i}-${j}`}
                  x={x}
                  y={y}
                  size={cellSize}
                  xData={rawData[colCol] || []}
                  yData={rawData[rowCol] || []}
                  xLabel={colCol}
                  yLabel={rowCol}
                />
              );
            }

            // Lower triangle: Correlation values
            const r = getCorrelation(rowCol, colCol);
            return (
              <g key={`${i}-${j}`}>
                {/* Background */}
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill="currentColor"
                  className="text-bg-page"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border-default"
                />
                {/* Correlation value */}
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-sm font-bold font-mono fill-current ${getCorrColor(r)}`}
                >
                  {formatCorr(r)}
                </text>
              </g>
            );
          });
        })}

        {/* Border */}
        <rect
          x={padding}
          y={padding}
          width={totalSize}
          height={totalSize}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-default"
        />
      </svg>

      {/* Info */}
      <div className="mt-4 p-3 bg-bg-page rounded-lg text-xs text-text-secondary max-w-2xl mx-auto">
        <p className="font-medium text-text-primary mb-1">💡 Reading the Matrix</p>
        <ul className="space-y-1">
          <li>• <strong className="text-text-primary">Upper triangle:</strong> Scatter plots show data point relationships</li>
          <li>• <strong className="text-text-primary">Diagonal:</strong> Column names</li>
          <li>• <strong className="text-text-primary">Lower triangle:</strong> Correlation coefficients (-1 to +1)</li>
          {allColumns.length > 6 && (
            <li className="text-warning-text">
              • Showing top 6 of {allColumns.length} columns (by avg correlation strength)
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/**
 * Individual scatter plot cell component.
 * Renders a mini scatter plot with sampled points.
 */
function ScatterCell({
  x,
  y,
  size,
  xData,
  yData,
  xLabel,
  yLabel,
}: {
  x: number;
  y: number;
  size: number;
  xData: number[];
  yData: number[];
  xLabel: string;
  yLabel: string;
}) {
  // Sample data if too many points (max 200 points per scatter)
  const maxPoints = 200;
  const sampledData = useMemo(() => {
    const validPairs = xData
      .map((xVal, i) => ({ x: xVal, y: yData[i] }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    if (validPairs.length <= maxPoints) return validPairs;

    // Random sampling
    const step = Math.floor(validPairs.length / maxPoints);
    return validPairs.filter((_, i) => i % step === 0).slice(0, maxPoints);
  }, [xData, yData]);

  // Calculate scales
  const { xScale, yScale } = useMemo(() => {
    if (sampledData.length === 0) {
      return {
        xScale: () => size / 2,
        yScale: () => size / 2,
      };
    }

    const xMin = Math.min(...sampledData.map(p => p.x));
    const xMax = Math.max(...sampledData.map(p => p.x));
    const yMin = Math.min(...sampledData.map(p => p.y));
    const yMax = Math.max(...sampledData.map(p => p.y));

    const padding = size * 0.1;

    const xScale = (val: number) =>
      padding + ((val - xMin) / (xMax - xMin || 1)) * (size - 2 * padding);

    const yScale = (val: number) =>
      size - padding - ((val - yMin) / (yMax - yMin || 1)) * (size - 2 * padding);

    return { xScale, yScale };
  }, [sampledData, size]);

  if (sampledData.length === 0) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          fill="currentColor"
          className="text-bg-page"
        />
        <text
          x={x + size / 2}
          y={y + size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[8px] text-text-tertiary fill-current italic"
        >
          No data
        </text>
      </g>
    );
  }

  return (
    <g>
      {/* Background */}
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="currentColor"
        className="text-bg-page"
      />

      {/* Data points */}
      {sampledData.map((point, i) => (
        <circle
          key={i}
          cx={x + xScale(point.x)}
          cy={y + yScale(point.y)}
          r={1.5}
          fill="currentColor"
          className="text-primary"
          opacity="0.4"
        />
      ))}

      {/* Border */}
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-border-default"
      />
    </g>
  );
}
