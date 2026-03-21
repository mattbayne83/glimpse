# Story Mode - Phase 1: Foundation

**Goal:** Story Mode UI and navigation working with mock slides
**Timeline:** Week 1 (March 21-27, 2026)
**Status:** In Progress

---

## Tasks

### Setup
- [ ] Create `src/components/story/` directory
- [ ] Create `src/types/story.ts` for TypeScript interfaces
- [ ] Add story mode state to Zustand store (optional, may use local state)

### Core Components
- [ ] **StoryMode.tsx** (~300 lines)
  - Full-screen overlay container (fixed, z-50, bg-black)
  - Slide transition animations (opacity + translateX)
  - Keyboard event listeners (←/→/ESC)
  - Click navigation (left/right halves of screen)
  - Current slide index state management
  - Exit handler (close → return to AnalysisView)

- [ ] **StorySlide.tsx** (~150 lines)
  - Slide wrapper with enter/exit animations
  - Centered content container (max-w-4xl)
  - Fade-in transition (opacity 0→1)
  - Scale animation (0.95→1.0)
  - Dark mode support (white text on black bg)

- [ ] **StoryProgress.tsx** (~80 lines)
  - Horizontal row of dots (bottom center)
  - Active dot highlighted (larger, brighter)
  - Click to jump to slide
  - Smooth transitions between states

### Mock Slides
- [ ] **TitleSlide.tsx** (~100 lines)
  - Display dataset name + dimensions
  - Upload date
  - Insight count teaser
  - Fade-in animation (500ms delay)

- [ ] **InsightsPreviewSlide.tsx** (~120 lines)
  - 2×4 grid of insight type cards
  - Icons (📊 📈 ⚠️ 🎯) + labels
  - "Click or press → to explore" prompt

- [ ] **MockInsightSlide.tsx** (~150 lines)
  - Generic template for testing
  - Title + description + placeholder chart area
  - Will be replaced by real insight slides in Phase 3

### Integration
- [ ] **AnalysisView.tsx updates**
  - Add "📖 Tell the Story" button to header (next to Export/Copy)
  - Button styling: ghost variant, icon + text
  - Click handler: setState to show StoryMode
  - Conditional render: {showStory && <StoryMode />}

- [ ] **Mock Story Generator**
  - Create `src/utils/story/mockStoryGenerator.ts`
  - Function: `generateMockStory(analysisResult: AnalysisResult): Slide[]`
  - Returns 3 hardcoded slides using real dataset stats
  - Slide 1: TitleSlide with actual dataset name
  - Slide 2: InsightsPreviewSlide (placeholder icons)
  - Slide 3: MockInsightSlide with one real correlation

### Testing Checklist
- [ ] Full-screen mode works (covers entire viewport)
- [ ] Arrow keys navigate between slides
- [ ] ESC exits back to analysis view
- [ ] Progress dots update on slide change
- [ ] Click left/right areas of slide to navigate
- [ ] Animations are smooth (60fps, no jank)
- [ ] Works in dark mode (white text on black)
- [ ] Mobile responsive (touch-friendly, readable)
- [ ] No console errors or warnings

---

## Component Architecture

```
AnalysisView
  ├── Header
  │   └── [📖 Tell the Story] Button
  └── {showStory && (
      <StoryMode slides={mockSlides} onClose={...}>
        {slides.map((slide, i) => (
          <StorySlide key={i} isActive={i === currentSlide}>
            {renderSlideContent(slide)}
          </StorySlide>
        ))}
        <StoryProgress
          current={currentSlide}
          total={slides.length}
          onJump={setCurrentSlide}
        />
      </StoryMode>
    )}
```

---

## TypeScript Interfaces

```typescript
// src/types/story.ts

export type SlideType =
  | 'title'
  | 'preview'
  | 'correlation'
  | 'distribution'
  | 'timeTrend'
  | 'outlier'
  | 'category'
  | 'quality'
  | 'nextSteps';

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  data: any; // Slide-specific data (correlation values, chart data, etc.)
}

export interface StoryModeProps {
  slides: Slide[];
  onClose: () => void;
}

export interface StorySlideProps {
  slide: Slide;
  isActive: boolean;
}

export interface StoryProgressProps {
  current: number;
  total: number;
  onJump: (index: number) => void;
}
```

---

## Animation Specifications

### Slide Transitions
```typescript
// Framer Motion variants (or CSS transitions)
const slideVariants = {
  enter: {
    opacity: 0,
    x: 100,
    scale: 0.95
  },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    scale: 0.95,
    transition: {
      duration: 0.4,
      ease: 'easeIn'
    }
  }
};
```

### Progress Dots
```css
/* Active dot */
.dot-active {
  transform: scale(1.5);
  opacity: 1;
  transition: all 0.3s ease;
}

/* Inactive dots */
.dot-inactive {
  transform: scale(1);
  opacity: 0.5;
  transition: all 0.3s ease;
}

/* Hover state */
.dot:hover {
  transform: scale(1.3);
  opacity: 0.8;
  cursor: pointer;
}
```

---

## Success Criteria

By end of Phase 1, we should have:
- ✅ Full-screen story mode that launches from button
- ✅ Smooth navigation between 3 mock slides
- ✅ Keyboard shortcuts working (arrows, ESC)
- ✅ Progress indicator updating correctly
- ✅ Mobile-responsive layout
- ✅ Dark mode support
- ✅ Zero TypeScript errors
- ✅ Clean console (no warnings)

**Demo-able milestone:** Show a business analyst:
> "Click 'Tell the Story', navigate through 3 slides with arrows, press ESC to exit"

If that feels smooth and intuitive, Phase 1 is done.

---

## Notes

- **No real insight detection yet** - Phase 1 is purely UI/UX foundation
- **Mock slides use real dataset stats** - Name, dimensions, upload date (validates data flow)
- **Keep it simple** - Resist urge to add features (edit mode, export, etc.)
- **Focus on feel** - Animations should feel polished, not janky
- **Mobile-first** - Test on phone throughout development

---

## Next: Phase 2 (After Phase 1 Complete)

Once navigation works smoothly, we'll tackle:
- Insight detection algorithms (correlation, distribution, time trends)
- Interestingness scoring (rank insights 0-100)
- Slide ordering (diversify types, top 8 insights)
