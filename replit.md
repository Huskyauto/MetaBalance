# MetaBalance - Health & Wellness Tracking App

## Project Overview

MetaBalance is a comprehensive health tracking application that helps users manage their weight loss journey through dietary tracking, fasting protocols, AI coaching, and progress visualization.

## Current State

**Status**: Fully functional application with database persistence, AI integration, and Replit Auth

### Completed Features
- **Replit Auth** - Full OIDC authentication with login/logout
- Dashboard with health metrics overview (real data)
- Daily wins tracking with streak counter
- Nutrition progress visualization
- Weight tracking charts
- Dietary tracking page with Spoonacular food search API
- Fasting timer with multiple protocols
- AI coach chat interface (OpenAI integration)
- **Emotional Wellness** - Emotional eating support with mood check-ins, journaling, and coping strategies
- Research hub with health articles
- Dark/light theme toggle (light mode default)
- Responsive navigation with user profile dropdown
- Settings page for user profile and goals
- Auto-calculate nutrition targets based on stats (Mifflin-St Jeor formula)
- PostgreSQL database with Drizzle ORM

### Emotional Wellness Feature
The Emotional Wellness tab helps users understand and manage emotional eating:

**Mood Check-in Tab:**
- Select current mood (stressed, anxious, sad, bored, lonely, tired, angry, overwhelmed, happy, neutral)
- Rate emotional intensity (1-10)
- Assess actual hunger level (1-10) to distinguish physical vs emotional hunger
- Identify triggers (work stress, family issues, boredom, etc.)
- Context tracking (before eating, during craving, after eating)
- Recent check-ins history

**Journal Tab:**
- Reflective journaling with prompts
- Entry types: reflection, breakthrough, challenge, gratitude, pattern insight
- Built-in prompts to guide self-exploration
- Full journal history with delete capability

**Coping Toolbox Tab:**
- Personal collection of healthy coping strategies
- Categories: physical, mental, social, creative, self-care
- Default strategy suggestions to get started
- Track usage frequency
- Favorite strategies

## Authentication

The app uses Replit Auth (OIDC) for authentication:

- **Landing Page** (`/`) - Shown to unauthenticated users with "Sign In" and "Get Started" buttons
- **Login Flow** - `/api/login` initiates OIDC auth, `/api/callback` handles the redirect
- **Logout** - `/api/logout` ends session and redirects to landing
- **Protected Routes** - All API routes use `isAuthenticated` middleware
- **User Session** - Stored in PostgreSQL `sessions` table with automatic token refresh

**Key Auth Files:**
- `server/replitAuth.ts` - OIDC middleware setup
- `client/src/hooks/useAuth.ts` - React hook for auth state
- `client/src/pages/Landing.tsx` - Public landing page

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
│   │   ├── EmotionalWellness.tsx
│   │   ├── Settings.tsx
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
