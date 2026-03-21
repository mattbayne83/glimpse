import type { StoryProgressProps } from '../../types/story';

/**
 * StoryProgress - Progress indicator with clickable dots
 *
 * Features:
 * - Horizontal row of dots
 * - Active dot is larger and brighter
 * - Click to jump to slide
 * - Smooth transitions
 */
export default function StoryProgress({ current, total, onJump }: StoryProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isPast = i < current;

        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`
              rounded-full transition-all duration-300 cursor-pointer
              ${isActive
                ? 'w-3 h-3 bg-primary scale-125 opacity-100'
                : isPast
                  ? 'w-2 h-2 bg-text-secondary opacity-70 hover:opacity-90 hover:scale-110'
                  : 'w-2 h-2 bg-text-tertiary opacity-40 hover:opacity-60 hover:scale-110'
              }
            `}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={isActive ? 'true' : 'false'}
          />
        );
      })}

      {/* Slide counter */}
      <span className="ml-3 text-sm text-text-secondary font-mono">
        {current + 1} / {total}
      </span>
    </div>
  );
}
