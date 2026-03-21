import { useMemo } from 'react';
import type { TimeSeriesAnalysis } from '../types/analysis';

interface TimeSeriesPlotProps {
  dates: string[];  // ISO date strings
  values: number[];
  columnName: string;
  seasonality?: TimeSeriesAnalysis;
  width?: number;
  height?: number;
}

/**
 * Time series line chart with optional trend line and seasonality indicators.
 * Pure SVG implementation following Glimpse's visualization patterns.
 */
export function TimeSeriesPlot({
  dates,
  values,
  columnName,
  seasonality,
  width = 600,
  height = 300,
}: TimeSeriesPlotProps) {
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Convert dates to timestamps for plotting
  const timestamps = useMemo(() => dates.map(d => new Date(d).getTime()), [dates]);

  // Calculate scales
  const { xScale, yScale, trendLine } = useMemo(() => {
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // Add 10% padding to y-axis
    const yPadding = valueRange * 0.1;

    const xScale = (timestamp: number) =>
      ((timestamp - minTime) / (maxTime - minTime)) * plotWidth;

    const yScale = (value: number) =>
      plotHeight - ((value - (minValue - yPadding)) / (valueRange + 2 * yPadding)) * plotHeight;

    // Calculate linear trend line using least squares
    const n = timestamps.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = timestamps.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendLine = {
      start: { x: minTime, y: slope * minTime + intercept },
      end: { x: maxTime, y: slope * maxTime + intercept },
    };

    return { xScale, yScale, trendLine };
  }, [timestamps, values, plotWidth, plotHeight]);

  // Generate path for the time series line
  const linePath = useMemo(() => {
    return timestamps
      .map((time, i) => {
        const x = padding.left + xScale(time);
        const y = padding.top + yScale(values[i]);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  }, [timestamps, values, xScale, yScale, padding]);

  // Generate trend line path
  const trendPath = useMemo(() => {
    const x1 = padding.left + xScale(trendLine.start.x);
    const y1 = padding.top + yScale(trendLine.start.y);
    const x2 = padding.left + xScale(trendLine.end.x);
    const y2 = padding.top + yScale(trendLine.end.y);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }, [trendLine, xScale, yScale, padding]);

  // Format date for axis labels
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  // Format value for axis labels
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
    if (Math.abs(value) < 1 && value !== 0) return value.toFixed(2);
    return value.toFixed(0);
  };

  // Generate X-axis ticks (show ~5 ticks)
  const xTicks = useMemo(() => {
    const numTicks = 5;
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const step = (maxTime - minTime) / (numTicks - 1);
    return Array.from({ length: numTicks }, (_, i) => minTime + step * i);
  }, [timestamps]);

  // Generate Y-axis ticks (show ~5 ticks)
  const yTicks = useMemo(() => {
    const numTicks = 5;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const step = (maxValue - minValue) / (numTicks - 1);
    return Array.from({ length: numTicks }, (_, i) => minValue + step * i);
  }, [values]);

  return (
    <div className="w-full">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Gridlines */}
        {yTicks.map((tick, i) => (
          <line
            key={`grid-y-${i}`}
            x1={padding.left}
            y1={padding.top + yScale(tick)}
            x2={padding.left + plotWidth}
            y2={padding.top + yScale(tick)}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.1"
            className="text-text-tertiary"
          />
        ))}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-default"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={padding.left + plotWidth}
          y2={padding.top + plotHeight}
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-default"
        />

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={`label-y-${i}`}
            x={padding.left - 10}
            y={padding.top + yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-[10px] font-mono text-text-secondary fill-current"
          >
            {formatValue(tick)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick, i) => (
          <text
            key={`label-x-${i}`}
            x={padding.left + xScale(tick)}
            y={padding.top + plotHeight + 20}
            textAnchor="middle"
            className="text-[10px] font-mono text-text-secondary fill-current"
          >
            {formatDate(tick)}
          </text>
        ))}

        {/* Seasonality indicators (shaded periods) */}
        {seasonality?.seasonalityDetected && seasonality.estimatedPeriod && (
          <>
            {Array.from(
              { length: Math.floor(timestamps.length / seasonality.estimatedPeriod) },
              (_, i) => i * seasonality.estimatedPeriod!
            ).map((startIdx, i) => {
              if (i % 2 === 0) return null; // Only shade every other period
              const endIdx = Math.min(startIdx + seasonality.estimatedPeriod!, timestamps.length - 1);
              const x1 = padding.left + xScale(timestamps[startIdx]);
              const x2 = padding.left + xScale(timestamps[endIdx]);
              return (
                <rect
                  key={`season-${i}`}
                  x={x1}
                  y={padding.top}
                  width={x2 - x1}
                  height={plotHeight}
                  fill="currentColor"
                  opacity="0.05"
                  className="text-primary"
                />
              );
            })}
          </>
        )}

        {/* Trend line (dashed) */}
        <path
          d={trendPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.5"
          className="text-warning"
        />

        {/* Time series line */}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* Data points */}
        {timestamps.map((time, i) => (
          <circle
            key={`point-${i}`}
            cx={padding.left + xScale(time)}
            cy={padding.top + yScale(values[i])}
            r="3"
            fill="currentColor"
            className="text-primary"
          >
            <title>
              {formatDate(time)}: {formatValue(values[i])}
            </title>
          </circle>
        ))}

        {/* Axis labels */}
        <text
          x={padding.left + plotWidth / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-xs font-medium text-text-secondary fill-current"
        >
          Date
        </text>

        <text
          x={15}
          y={padding.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 15 ${padding.top + plotHeight / 2})`}
          className="text-xs font-medium text-text-secondary fill-current"
        >
          {columnName}
        </text>
      </svg>

      {/* Legend */}
      {seasonality?.seasonalityDetected && (
        <div className="mt-3 p-3 bg-bg-page rounded-lg text-xs text-text-secondary">
          <p className="font-medium text-text-primary mb-1">📊 Seasonality Detected</p>
          <p>
            Period: <span className="font-mono text-text-primary">{seasonality.estimatedPeriod} days</span>
            {' • '}
            Confidence: <span className={`font-medium ${
              seasonality.confidence === 'high' ? 'text-success' :
              seasonality.confidence === 'medium' ? 'text-warning' :
              'text-text-tertiary'
            }`}>{seasonality.confidence}</span>
          </p>
          <p className="mt-1 text-[10px]">
            Shaded regions indicate detected seasonal periods. Dashed line shows overall trend.
          </p>
        </div>
      )}
    </div>
  );
}
