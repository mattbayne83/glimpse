interface NarrativeTextProps {
  text: string;
  className?: string;
}

/**
 * NarrativeText - Formatted text for slide narratives
 *
 * Provides consistent typography for explanatory text
 */
export default function NarrativeText({ text, className = '' }: NarrativeTextProps) {
  return (
    <p className={`text-text-primary text-base md:text-lg leading-relaxed max-w-3xl mx-auto ${className}`}>
      {text}
    </p>
  );
}
