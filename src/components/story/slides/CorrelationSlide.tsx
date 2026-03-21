import type { Slide, CorrelationInsightData } from '../../../types/story';
import SlideLayout from './SlideLayout';
import NarrativeText from './NarrativeText';

interface CorrelationSlideProps {
  slide: Slide;
}

/**
 * CorrelationSlide - Shows scatter plot of correlated variables
 *
 * Displays:
 * - Correlation strength and direction
 * - Statistical significance
 * - Visual scatter plot (simplified for Phase 3)
 * - Actionable insight
 */
export default function CorrelationSlide({ slide }: CorrelationSlideProps) {
  const data = slide.data as unknown as CorrelationInsightData;

  // Generate narrative text
  const narrative = `${data.column1} and ${data.column2} show a ${data.strength} ${data.direction} correlation (r=${Math.abs(data.r).toFixed(3)}). ${
    data.pValue < 0.001
      ? 'This relationship is highly statistically significant.'
      : data.pValue < 0.01
        ? 'This relationship is statistically significant.'
        : 'This relationship is statistically significant at the 5% level.'
  }`;

  // Generate insight based on correlation direction
  const insight = data.direction === 'positive'
    ? `As ${data.column1.toLowerCase()} increases, ${data.column2.toLowerCase()} tends to increase as well. Consider leveraging this relationship in analysis or predictions.`
    : `As ${data.column1.toLowerCase()} increases, ${data.column2.toLowerCase()} tends to decrease. This inverse relationship may indicate competing factors or trade-offs.`;

  return (
    <SlideLayout title={slide.title} subtitle={slide.subtitle} insight={insight}>
      <div className="space-y-6">
        {/* Narrative */}
        <NarrativeText text={narrative} className="text-center" />

        {/* Scatter Plot Placeholder */}
        <div className="relative mx-auto max-w-2xl">
          <div className="aspect-[3/2] bg-bg-elevated border border-border-default rounded-2xl flex items-center justify-center overflow-hidden">
            {/* Simple scatter plot visualization */}
            <ScatterPlot
              correlation={data.r}
              strength={data.strength}
              direction={data.direction}
            />
          </div>

          {/* Stats below chart */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-text-secondary">
            <div>
              <span className="text-text-tertiary">Correlation: </span>
              <span className="text-text-primary font-mono">{data.r.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-text-tertiary">p-value: </span>
              <span className="text-text-primary font-mono">
                {data.pValue < 0.001 ? '<0.001' : data.pValue.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-text-tertiary">Sample: </span>
              <span className="text-text-primary font-mono">{data.sampleSize.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

/**
 * Simple scatter plot visualization
 * Shows correlation strength and direction visually
 */
function ScatterPlot({
  correlation,
  strength,
  direction,
}: {
  correlation: number;
  strength: string;
  direction: string;
}) {
  // Generate sample points that follow the correlation
  const points = generateCorrelatedPoints(correlation, 50);

  // Use current color for all strengths (will adapt to theme)
  const color = 'currentColor';
  const opacity = strength === 'strong' ? '0.8' : strength === 'moderate' ? '0.6' : '0.5';

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 300" className="p-8 text-primary">
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#grid)" />

      {/* Axes */}
      <line x1="40" y1="260" x2="360" y2="260" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="40" y1="40" x2="40" y2="260" stroke="currentColor" strokeWidth="2" opacity="0.3" />

      {/* Trend line */}
      <line
        x1="60"
        y1={direction === 'positive' ? 240 : 60}
        x2="340"
        y2={direction === 'positive' ? 60 : 240}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity={opacity}
      />

      {/* Scatter points */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={color}
          opacity={opacity}
          style={{
            animation: `fade-in 0.3s ease-out ${i * 10}ms both`,
          }}
        />
      ))}

      {/* Axis labels */}
      <text x="200" y="290" textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="12">
        →
      </text>
      <text x="15" y="150" textAnchor="middle" fill="currentColor" opacity="0.4" fontSize="12">
        ↑
      </text>
    </svg>
  );
}

/**
 * Generate random points that follow a correlation pattern
 */
function generateCorrelatedPoints(r: number, count: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < count; i++) {
    // Random x between 60 and 340
    const x = 60 + Math.random() * 280;

    // y depends on x and correlation strength
    const baseY = r > 0 ? 260 - ((x - 60) / 280) * 200 : 60 + ((x - 60) / 280) * 200;

    // Add noise inversely proportional to correlation strength
    const noise = (1 - Math.abs(r)) * 60 * (Math.random() - 0.5);
    const y = Math.max(60, Math.min(240, baseY + noise));

    points.push({ x, y });
  }

  return points;
}
