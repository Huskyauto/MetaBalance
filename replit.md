# MetaBalance - Health & Wellness Tracking App

## Project Overview

MetaBalance is a comprehensive health tracking application that helps users manage their weight loss journey through dietary tracking, fasting protocols, AI coaching, and progress visualization.

## Current State

**Status**: Frontend prototype complete with mock data

### Completed Features
- Dashboard with health metrics overview
- Daily wins tracking with streak counter
- Nutrition progress visualization
- Weight tracking charts
- Dietary tracking page with food search
- Fasting timer with multiple protocols
- AI coach chat interface
- Research hub with health articles
- Dark/light theme toggle
- Responsive navigation

### Pending Implementation
- Database schema and migrations
- Backend API routes for CRUD operations
- Real data persistence (currently uses mock data)
- OpenAI integration for AI coaching
- Real food search API integration

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query v5
- **Backend**: Express.js
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI API (configured, not yet integrated)

## Project Structure

```
├── client/src/
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── examples/       # Component examples
│   │   ├── AICoachChat.tsx
│   │   ├── DailyWins.tsx
│   │   ├── FastingTimer.tsx
│   │   ├── FoodSearch.tsx
│   │   ├── MealLogCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── Navigation.tsx
│   │   ├── NutritionProgress.tsx
│   │   ├── QuickActions.tsx
│   │   ├── ResearchHub.tsx
│   │   ├── StreakCounter.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── WeeklyReflection.tsx
│   │   └── WeightProgressChart.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── DietaryTracking.tsx
│   │   ├── Progress.tsx
│   │   ├── Fasting.tsx
│   │   ├── Coach.tsx
│   │   └── Research.tsx
│   ├── hooks/
│   ├── lib/
│   ├── App.tsx
│   └── index.css
├── server/
│   ├── routes.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
└── design_guidelines.md
```

## Design Guidelines

- Dark theme enabled by default
- Teal primary color (hue 180)
- Inter font family
- All components use shadcn/ui primitives
- Follows universal design guidelines in design_guidelines.md

## Running the App

The workflow "Start application" runs `npm run dev` which starts both:
- Express backend server
- Vite frontend dev server

App is served on port 5000.

## Mock Data Locations

Files containing mock data (marked with "todo: remove mock functionality"):
- Dashboard.tsx - Weight data, metrics
- DietaryTracking.tsx - Meal logs, food search
- Progress.tsx - Achievement data
- Fasting.tsx - Timer state
- Coach.tsx - Chat messages
- AICoachChat.tsx - AI responses
- FoodSearch.tsx - Food database
- ResearchHub.tsx - Article content
- WeeklyReflection.tsx - AI insights

## Next Steps for Backend Implementation

1. Create database schema in shared/schema.ts:
   - users (profiles, preferences)
   - weight_logs (daily weight entries)
   - meals (food logs with macros)
   - fasting_sessions (fasting history)
   - daily_goals (win tracking)
   - streaks (streak data)
   - chat_messages (AI conversation history)

2. Implement API routes in server/routes.ts

3. Connect OpenAI for AI coaching responses

4. Integrate real food database API
