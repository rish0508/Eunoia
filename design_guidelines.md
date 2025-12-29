# Eunoia - Design Guidelines

## Design Approach
**Theme:** Celestial/Night Sky - Stars, moons, and dreamy twilight aesthetics
**Core Philosophy:** Magical, inspiring environment that encourages daily reflection with motivational energy

## Color Palette

### Light Mode (Twilight Theme)
- **Background**: Soft lavender-white (240 20% 97%)
- **Primary**: Deep purple (260 60% 55%)
- **Accent**: Golden star color (45 80% 60%)
- **Cards**: Slightly elevated lavender (245 22% 95%)
- **Muted**: Soft purple-gray (250 16% 89%)

### Dark Mode (Night Sky Theme)
- **Background**: Deep indigo-black (250 30% 8%)
- **Primary**: Bright purple (260 70% 65%)
- **Accent**: Golden/amber stars (45 90% 60%)
- **Cards**: Elevated night blue (250 28% 12%)
- **Muted**: Deep purple (250 22% 18%)

## Typography Hierarchy

**Font Stack:** 
- All text: Inter (Google Fonts)
- App title: Gradient text (primary to accent)

**Scale:**
- Page titles: text-2xl font-semibold
- Entry dates: text-sm font-medium
- Body text: text-base leading-relaxed
- Metadata: text-xs text-muted-foreground

## Visual Elements

### Celestial Decorations
- **Star Field**: 50 animated stars in background with twinkling effect
- **Moon Icon**: In header with floating animation
- **Sparkle Accents**: On key elements and buttons
- **Star Icons**: For target achievements

### Animations
- `twinkle`: Stars fade in/out (3-7s duration, random delays)
- `float`: Moon gently bobs up/down (6s)

### Daily Motivational Quotes
- New inspirational quote each day
- Displayed in gradient card at top of main content
- Star icon prefix
- Italic text styling

## Core Components

### Quote Card
- Gradient background: from-primary/10 to-accent/10
- Border: border-primary/20
- Content: Star icon + quote text
- Full width, prominent placement

### Journal Entry Card
- Rounded corners (rounded-md)
- Padding: p-6
- Sections:
  - Target Plan (highlighted with accent background)
  - Reflection
  - Gym Status + Notes
  - Food
  - Photos grid
  - Videos grid

### Target Plan Section
- Accent-highlighted container (bg-accent/10, border-accent/20)
- Target icon with accent color
- Prominent placement at top of entry

### Empty State
- Moon icon in muted background circle
- Sparkles button for creating entries
- Encouraging message

### Calendar View
- Moon icon in header
- Entry indicators with mood icons and stars
- Primary ring on current day
- Hover states with elevation

## Layout Architecture

**Spacing System:** Tailwind units of 2, 4, 6, 8
- Section gaps: space-y-6
- Element gaps: gap-2 to gap-4
- Card padding: p-4 to p-6

**Responsive Strategy:**
- Mobile: Single column, full-width (container mx-auto px-4)
- Desktop: max-w-4xl centered content
- Floating action button: bottom-6 right-6 (md: bottom-8 right-8)

## Interaction Patterns

### Form Reset Behavior
- Form clears completely when switching dates
- Form populates with existing entry data when editing
- Images and videos reset appropriately

### Media Upload
- Photos: Base64 encoded, grid display
- Videos: Base64 encoded (max 50MB), video player display
- Mobile-friendly capture interface

## Responsive Adaptations

**Mobile (< 768px):**
- Full-width layout
- Single column grids
- Floating action button repositioned
- Video upload with camera capture

**Desktop (≥ 768px):**
- Centered content with max-width
- Two-column grids for gym/food
- Larger floating action button position

## Accessibility
- Focus visible on all interactive elements
- Aria labels for icon-only buttons
- Keyboard navigation throughout
- High contrast in both themes
- data-testid on all interactive elements
