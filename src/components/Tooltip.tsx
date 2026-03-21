import { useState, useEffect, useId } from 'react';

interface TooltipProps {
  term: string;        // Term name for header
  content: string;     // Definition text
  example?: string;    // Optional example text
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Educational tooltip with visual hierarchy and glassmorphic treatment.
 * Shows term name as header, followed by definition.
 * 300ms hover delay prevents accidental triggers while scrolling.
 */
export function Tooltip({ term, content, example, children, className = '', align = 'center' }: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();

  // 300ms delay before showing tooltip, immediate hide on unhover
  useEffect(() => {
    let timeout: number;
    if (isHovered) {
      timeout = window.setTimeout(() => setShowTooltip(true), 300);
    } else {
      // Immediate hide (0ms timeout satisfies ESLint rule)
      timeout = window.setTimeout(() => setShowTooltip(false), 0);
    }
    return () => window.clearTimeout(timeout);
  }, [isHovered]);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-describedby={showTooltip ? tooltipId : undefined}
    >
      {children}

      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 p-4 bg-bg-surface/95 backdrop-blur-md
            border border-border-default/80
            rounded-lg shadow-xl w-max max-w-xs pointer-events-none
            top-full mt-2.5 animate-fade-in-tooltip
            ${align === 'center' ? 'left-1/2 -translate-x-1/2' : ''}
            ${align === 'right' ? 'right-0' : ''}
            ${align === 'left' ? 'left-0' : ''}
          `}
        >
          {/* Term Header */}
          <div className="font-semibold text-sm text-text-primary mb-1.5 capitalize">
            {term.toLowerCase()}
          </div>

          {/* Definition Body */}
          <div className="text-sm text-text-secondary leading-relaxed normal-case">
            {content}
          </div>

          {/* Example (if provided) - More compact */}
          {example && (
            <div className="mt-3 p-3 rounded-md bg-text-secondary/5 border border-border-default/30 text-xs text-text-secondary leading-relaxed normal-case">
              <span className="font-semibold block mb-1">Example:</span>
              {example}
            </div>
          )}

          {/* Arrow */}
          <div className={`
            absolute w-2.5 h-2.5
            bg-bg-surface/95 border-border-default/80 rotate-45
            top-[-6px] border-t border-l
            ${align === 'center' ? 'left-1/2 -translate-x-1/2' : ''}
            ${align === 'right' ? 'right-4' : ''}
            ${align === 'left' ? 'left-4' : ''}
          `} />
        </div>
      )}
    </div>
  );
}
