import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import type { StoryModeProps } from '../../types/story';
import StorySlide from './StorySlide';
import StoryProgress from './StoryProgress';

/**
 * StoryMode - Full-screen presentation mode for auto-generated data stories
 *
 * Features:
 * - Full-screen overlay (z-50)
 * - Keyboard navigation (←/→/ESC)
 * - Click navigation (left/right halves)
 * - Progress indicator
 * - Smooth slide transitions
 */
export default function StoryMode({ slides, onClose }: StoryModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= slides.length) return;
    setDirection(index > currentSlide ? 'forward' : 'backward');
    setCurrentSlide(index);
  }, [currentSlide, slides.length]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection('forward');
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection('backward');
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ': // Space
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, onClose, slides.length]);

  // Click navigation (left/right halves of screen)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Don't navigate if clicking interactive elements
    if (target.closest('button') || target.closest('a')) {
      return;
    }

    const clickX = e.clientX;
    const screenWidth = window.innerWidth;

    if (clickX < screenWidth / 3) {
      prevSlide();
    } else if (clickX > (screenWidth * 2) / 3) {
      nextSlide();
    }
  };

  // Prevent body scroll when story mode is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-page text-text-primary overflow-hidden"
      onClick={handleClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border-default transition-colors"
        aria-label="Close story mode"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Slide container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <StorySlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            direction={direction}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <StoryProgress
          current={currentSlide}
          total={slides.length}
          onJump={goToSlide}
        />
      </div>

      {/* Navigation hints (only show on first slide) */}
      {currentSlide === 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-text-tertiary text-sm animate-pulse">
          Press → or click to continue
        </div>
      )}
    </div>
  );
}
