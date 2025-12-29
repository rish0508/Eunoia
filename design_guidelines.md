# Personal Journaling App - Design Guidelines

## Design Approach
**System Foundation:** Notion-inspired minimalism meets Day One's warmth
**Core Philosophy:** Calm, distraction-free environment that encourages daily reflection without friction

## Layout Architecture

**Spacing System:** Tailwind units of 2, 4, 6, 8, 12, 16
- Dense information areas: p-4, gap-2
- Comfortable reading zones: p-6 to p-8
- Section separation: mb-12 to mb-16

**Responsive Strategy:**
- Mobile: Single column, full-width entries (p-4)
- Desktop: Two-column layout - sidebar navigation (w-64) + main content area (max-w-3xl)
- Breakpoint: md: for sidebar appearance

## Typography Hierarchy

**Font Stack:** 
- Headers: Inter (Google Fonts) - 600 weight
- Body: Inter - 400 weight
- Accent/Dates: Inter - 500 weight

**Scale:**
- Page titles: text-2xl md:text-3xl
- Entry dates: text-sm font-medium
- Body text: text-base leading-relaxed
- Metadata: text-xs

## Core Components

**Journal Entry Card:**
- Rounded corners (rounded-lg)
- Subtle elevation (shadow-sm)
- Padding: p-6
- Stack: Date/time header → Text area → Image grid → Footer (mood/achievement indicators)

**Navigation Sidebar (Desktop):**
- Fixed position
- Contains: Calendar widget, mood filter, quick stats, new entry button
- Spacing: py-8, px-4

**Mobile Navigation:**
- Bottom tab bar (fixed bottom) with: Today, Calendar, Gallery, Settings
- Icon-based with labels (text-xs)

**Text Input:**
- Borderless, seamless textarea
- Placeholder: "How was your day?"
- Auto-resize as user types
- min-height: 200px

**Image Upload Area:**
- Grid layout: grid-cols-2 md:grid-cols-3, gap-2
- Upload button: Dashed border, rounded-md, p-8
- Image thumbnails: aspect-square, object-cover, rounded

**Calendar View:**
- Monthly grid with entry indicators (dots or colored borders)
- Clickable dates to jump to entries
- Current day highlight
- Days with entries get visual marker

**Achievement Tracker:**
- Simple checkbox or toggle
- Labels: "Target Met" / "Rest Day"
- Positioned at entry footer

## Interaction Patterns

**Entry Creation Flow:**
1. Prominent "+" floating action button (bottom-right mobile, top-right desktop)
2. Modal/slide-up panel with date pre-filled
3. Focus immediately on text area
4. Auto-save every 3 seconds
5. Image upload via drag-drop or file picker

**Navigation:**
- Swipe between dates on mobile
- Keyboard shortcuts on desktop (Cmd+N for new entry)
- Quick date picker in header

**Calendar Interaction:**
- Click date to view/edit that day's entry
- Visual density: Indicate entry presence, mood, achievement status through subtle markers

## Responsive Adaptations

**Mobile (< 768px):**
- Full-width layout
- Bottom navigation bar
- Floating action button for new entry
- Stack all elements vertically
- Image grid: 2 columns

**Desktop (≥ 768px):**
- Sidebar + main content
- Hover states on calendar dates
- Keyboard navigation support
- Image grid: 3 columns

## Soothing Background Treatment

**Background Strategy:**
- Subtle gradient overlay or soft pattern
- Low contrast, warm tones suggested for color phase
- Consider: Soft noise texture (5% opacity) for depth
- Or: Gentle gradient that shifts based on time of day

## Performance & Privacy

- Local-first storage (IndexedDB)
- Lazy load images
- Optimistic UI updates
- No external analytics
- Export functionality for backup

## Images

**No Hero Image Required** - This is a functional app, not a marketing page

**User-Generated Images:**
- Display in entry cards as photo grid
- Thumbnails: 120px × 120px minimum
- Full view on click (lightbox modal)
- Support multiple images per entry

**Empty States:**
- Illustration or icon for "No entries yet"
- Welcoming message encouraging first entry
- Calendar view shows empty state for blank days

## Accessibility

- Focus visible on all interactive elements
- Aria labels for icon-only buttons
- Keyboard navigation throughout
- High contrast mode support
- Text scaling support