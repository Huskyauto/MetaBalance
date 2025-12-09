# MetaBalance

A comprehensive health and wellness tracking application designed to help users achieve their weight loss and fitness goals through intelligent tracking, AI coaching, and evidence-based insights.

## Features

### Dashboard
- Real-time health metrics overview (weight, calories, activity)
- Daily wins tracking with interactive goals
- Streak counter with milestone celebrations
- Nutrition progress with macro tracking
- Weight trend visualization

### Dietary Tracking
- Food search and logging
- Meal categorization (breakfast, lunch, dinner, snacks)
- Macro nutrient breakdown
- Calorie tracking against daily targets

### Weight Progress
- Visual weight charts with multiple time ranges
- Goal tracking with progress indicators
- Achievement system for milestones
- Historical data analysis

### Intermittent Fasting
- Multiple fasting protocol support (16:8, 18:6, 20:4, OMAD)
- Visual circular timer
- Fasting phase indicators
- Session history tracking

### AI Health Coach
- Personalized health advice
- Contextual suggestions based on progress
- Quick action recommendations
- Chat-based interaction

### Research Hub
- Evidence-based health articles
- Categorized content (nutrition, fasting, exercise, sleep)
- Educational resources

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API

## Project Structure

```
metabalance/
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── ui/         # shadcn/ui base components
│       │   └── examples/   # Component examples
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       └── lib/            # Utilities and configurations
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Data storage interface
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── design_guidelines.md    # UI/UX design specifications
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see Environment Variables section)
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `OPENAI_API_KEY` - OpenAI API key for AI coaching

## Development

The application runs on port 5000 in development mode with hot reloading enabled.

### Key Components

- **MetricCard** - Dashboard metric display cards
- **DailyWins** - Interactive daily goal tracking
- **StreakCounter** - Streak display with animations
- **NutritionProgress** - Circular progress charts for macros
- **WeightProgressChart** - SVG-based weight tracking chart
- **FastingTimer** - Circular fasting timer
- **AICoachChat** - AI chat interface
- **Navigation** - Responsive navigation with mobile support

## Design System

The app uses a modern dark theme with teal accent colors. All components follow the specifications in `design_guidelines.md` for consistent styling across the application.

### Color Palette
- Primary: Teal (hue 180)
- Background: Dark mode optimized
- Typography: Inter font family

## License

MIT License
