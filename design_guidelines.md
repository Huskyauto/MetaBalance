# MetaBalance Design Guidelines

## Design Approach

**Reference-Based Approach** - Drawing inspiration from leading health and wellness applications:
- **Primary References**: MyFitnessPal (nutrition tracking), Noom (behavioral coaching), Strava (progress visualization and social features)
- **Secondary Influences**: Headspace (motivational design), Notion (clean data presentation), Linear (modern dashboard UI)

**Core Design Principles**:
1. **Motivational First**: Every screen should inspire progress and celebrate wins
2. **Data Clarity**: Complex health data presented with visual simplicity
3. **Progressive Disclosure**: Show essential info first, details on demand
4. **Emotional Connection**: Use visual rewards (animations, badges) to build habits

## Typography System

**Font Stack**:
- Primary: Inter (headings, UI elements) - Clean, modern, excellent readability
- Secondary: system-ui (body text, data tables) - Native performance

**Type Scale**:
- Hero Headlines: text-5xl font-bold (onboarding, achievements)
- Page Titles: text-3xl font-semibold (dashboard sections)
- Section Headers: text-xl font-semibold (card titles)
- Body Text: text-base font-normal (descriptions, content)
- Data/Metrics: text-2xl font-bold (weight, calories, streaks)
- Labels: text-sm font-medium (form labels, chart axes)
- Captions: text-xs text-gray-400 (timestamps, metadata)

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-6 (cards), p-8 (sections)
- Vertical spacing: space-y-6 (card stacks), space-y-8 (page sections)
- Grid gaps: gap-4 (tight grids), gap-6 (standard), gap-8 (spacious)

**Container Strategy**:
- Dashboard/App Pages: max-w-7xl mx-auto px-4
- Content-Heavy Pages: max-w-4xl mx-auto (reading, forms)
- Full-Width: Charts, progress visualizations, social feeds

**Grid Patterns**:
- Desktop: 3-column feature cards (grid-cols-3), 2-column stats (grid-cols-2)
- Tablet: 2-column max (grid-cols-2)
- Mobile: Single column (grid-cols-1)

## Component Library

### Navigation
- **Top Navigation Bar**: Sticky header with logo, main nav links, profile avatar
- **Mobile Drawer**: Slide-out menu with icon + label navigation
- **Breadcrumbs**: For multi-level features (Settings → Notifications)

### Dashboard Components
- **Metric Cards**: Large number display with icon, trend indicator (↑/↓), and sparkline chart
- **Progress Rings**: Circular progress for daily goals (calories, protein, water)
- **Daily Wins Checklist**: Interactive checkboxes with instant visual feedback (filled stars)
- **Streak Counter**: Fire icon 🔥 with day count, milestone badges at 3/7/14/30 days
- **Quick Action Buttons**: Floating action button (FAB) for "Log Meal" primary action

### Tracking Interfaces
- **Food Search**: Autocomplete input with thumbnail images, nutrition preview on hover
- **Meal Log Cards**: Expandable cards showing food name, serving size, macro breakdown with progress bars
- **Chart Components**: Line charts (weight trend), bar charts (weekly calories), donut charts (macro split)
- **Date Picker**: Calendar view with color-coded star ratings per day

### AI Coaching
- **Chat Interface**: Message bubbles (user: right-aligned, AI: left-aligned with avatar)
- **Insight Cards**: Highlighted AI recommendations with actionable button ("Try This")
- **Context Panels**: Sidebar showing user stats the AI is referencing

### Social Features
- **Activity Feed**: Card-based timeline with user avatars, milestone achievements, progress photos
- **Friend Cards**: Profile picture, username, streak count, "Send Encouragement" quick action
- **Leaderboard**: Ranked list with position indicator, anonymous option toggle

### Gamification
- **Achievement Badges**: Colorful icon badges in grid layout (locked/unlocked states with grayscale filter)
- **Level Progress Bar**: Horizontal bar with current level, XP points, next level milestone
- **Celebration Modals**: Full-screen confetti animation for major milestones (5-star day, 30-day streak)

### Forms & Inputs
- **Text Inputs**: Floating labels, clear focus states with border color transition
- **Number Steppers**: +/- buttons for serving sizes, weight entries
- **Toggle Switches**: Premium feature gates, notification preferences
- **Radio Groups**: Activity level selection, fasting protocol choice

### Data Display
- **Stat Grids**: 2x2 or 3x3 grid showing key metrics (current weight, BMI, days logged)
- **Comparison Tables**: Side-by-side plan comparisons (Free vs Premium)
- **Nutrition Labels**: Detailed macro breakdown resembling FDA nutrition facts

### Overlays
- **Modals**: Centered modal for forms (log meal, add friend), max-w-2xl
- **Slide-Over Panels**: Right-side panel for detailed nutrition info, AI chat history
- **Toast Notifications**: Bottom-right success/error messages with auto-dismiss

## Images

**Hero Section** (Marketing/Landing Page):
- Large hero image showcasing app interface on phone mockup with blurred gradient background
- Alternatively: Split hero with product screenshot on right, headline + CTA on left
- Button over image: Use backdrop-blur-md with semi-transparent background

**In-App Images**:
- **Food Thumbnails**: 80x80px square images in meal log entries
- **Achievement Badges**: 120x120px colorful illustrated icons
- **Progress Photos**: User-uploaded photos in 1:1 aspect ratio cards
- **Empty States**: Friendly illustration when no data exists (e.g., "Start logging meals!")
- **Avatar Placeholders**: Circular user avatars with gradient backgrounds and initials

**Image Placement Strategy**:
- Dashboard: Minimal images, focus on data visualization
- Tracking Pages: Food thumbnails inline with meal entries
- Social Pages: User avatars, achievement badges, progress photos in masonry grid
- Education Hub: Header images for article categories

## Marketing/Landing Pages

**Landing Page Structure** (7-8 sections):
1. **Hero**: Full-viewport section with app mockup, bold headline, primary CTA, trust indicator ("10,000+ users")
2. **Features Grid**: 3-column layout with icons, feature cards showing key capabilities
3. **Progress Visualization**: Full-width interactive chart demo showing weight loss journey
4. **AI Coaching Showcase**: 2-column split with chat interface screenshot + explanation
5. **Social Proof**: 3-column testimonial cards with user photos, star ratings, quotes
6. **Pricing Tiers**: Side-by-side comparison table (Free vs Premium)
7. **Final CTA**: Centered hero-style section with signup form
8. **Footer**: 4-column layout (Product, Company, Resources, Social Links)

**Viewport Management**:
- Hero: 85vh for impact
- Content sections: Natural height with py-20 (desktop), py-12 (mobile)
- No forced viewport constraints on content

## Visual Enhancements

**Micro-Interactions**:
- Checkbox completion: Scale bounce animation
- Star ratings: Fill animation with subtle glow
- Progress bars: Smooth width transition (transition-all duration-300)
- Card hover: Slight lift effect (hover:shadow-lg hover:-translate-y-1)

**Data Visualization**:
- Use Recharts library for all charts
- Consistent teal accent color for primary data series
- Grid lines: subtle gray (opacity-20)
- Tooltips: Dark background with rounded corners, show precise values

**Loading States**:
- Skeleton screens matching component layout
- Pulse animation on placeholder elements
- Spinner only for full-page loads

**Empty States**:
- Centered illustration + message + primary action button
- Friendly, encouraging copy ("Ready to start your journey?")

This design system creates a cohesive, motivating health tracking experience that balances data density with visual appeal, encouraging consistent user engagement through thoughtful UI patterns and rewarding micro-interactions.