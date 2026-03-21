import { Lightbulb } from 'lucide-react';

interface SlideLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  insight?: string;
}

/**
 * SlideLayout - Consistent layout wrapper for all insight slides
 *
 * Provides:
 * - Centered title + subtitle
 * - Content area (chart/visualization)
 * - Optional insight section at bottom
 */
export default function SlideLayout({ title, subtitle, children, insight }: SlideLayoutProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="text-text-secondary text-lg md:text-xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Insight (if provided) */}
      {insight && (
        <div
          className="flex items-start gap-3 p-5 md:p-6 rounded-xl bg-primary-light border border-primary-border backdrop-blur-sm"
          style={{ animation: 'fade-in-up 0.5s ease-out 0.5s both' }}
        >
          <Lightbulb className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
          <div>
            <div className="font-semibold text-text-primary mb-1 text-sm uppercase tracking-wide">
              Insight
            </div>
            <p className="text-text-primary text-base leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
