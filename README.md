# MetaBalance

**Personalized Metabolic Health App for Obesity Reversal and Weight Loss**

MetaBalance is a comprehensive web application designed to help individuals achieve sustainable weight loss and metabolic health through evidence-based strategies, AI coaching, and personalized tracking.

## ✅ App Status: Production Ready (Grade A+)

**Latest Review:** December 6, 2025  
**Test Coverage:** 32/32 tests passing ✅  
**Critical Bugs:** Zero  
**Performance:** Excellent (instant loading with database caching)

## 🎯 Features

### Core Functionality
- **Profile Management** - Track current weight, target weight, metabolic conditions, and health goals with automatic initialization
- **Dietary Tracking** - Log meals with detailed nutrition information powered by Spoonacular API (300,000+ foods)
- **Nutrition Analytics** - Visualize daily macros, calories, and progress toward personalized nutrition goals
- **Intermittent Fasting Coach** - Track fasting windows and schedules with adherence monitoring
- **Supplement Library** - Manage supplement regimens with evidence-based information
- **Progress Tracking** - Monitor weight loss journey with visual charts and statistics
- **AI Health Coach** - Get personalized, context-aware advice powered by Grok AI with chat history
- **Education Hub** - Learn about metabolic health, obesity reversal, and lifestyle strategies
- **Weight Loss Research** - Access latest scientific findings and clinical trials (2024-2025) with instant loading and history tracking

### AI-Powered Features
- **Daily Insights** - Personalized motivational messages and health tips
- **Conversational AI Coach** - Context-aware health coaching with chat history
- **Research Summaries** - Grok AI generates comprehensive research content on:
  - GLP-1 medications (Semaglutide, Tirzepatide, emerging drugs)
  - Intermittent fasting protocols
  - Nutrition science and dietary strategies
  - Exercise and physical activity research
  - Metabolic health and cellular mechanisms

### Progressive Web App (PWA)
- **Installable** - Add to home screen on mobile and desktop devices
- **Offline Support** - Access core features without internet connection
- **App-like Experience** - Standalone mode with native app feel
- **Smart Caching** - Automatic caching of assets and API responses
- **Install Prompt** - Friendly prompt to install the app
- **Background Sync** - Sync data when connection is restored

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Data fetching and caching
- **Vite PWA** - Progressive Web App support with Workbox

### Backend
- **Node.js 22** - JavaScript runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **Vitest** - Unit testing framework

### External APIs
- **Spoonacular API** - Food and nutrition data
- **Grok AI (xAI)** - AI coaching and research generation
- **Manus OAuth** - Authentication system

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL or TiDB database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Huskyauto/MetaBalance.git
cd MetaBalance
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=your-oauth-server-url
VITE_OAUTH_PORTAL_URL=your-oauth-portal-url

# APIs
SPOONACULAR_API_KEY=your-spoonacular-api-key
XAI_API_KEY=your-grok-api-key

# App Configuration
VITE_APP_TITLE=MetaBalance
VITE_APP_ID=your-app-id
```

4. Push database schema:
```bash
pnpm db:push
```

5. Start development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

Current test coverage:
- **32 tests across 9 test files** - All passing ✅
- Profile management and automatic initialization
- Profile data persistence (test isolation with separate user IDs)
- Meal logging and nutrition tracking
- Research content storage and retrieval
- Nutrition goals calculation
- API integrations (Spoonacular, Grok)
- Authentication flows (login/logout)
- Food search functionality

## 📁 Project Structure

```
metabalance/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       └── lib/           # Utilities and tRPC client
├── server/                # Backend application
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries
│   ├── grok.ts            # Grok AI integration
│   └── _core/             # Framework code
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database tables
├── shared/                # Shared types and constants
└── storage/               # S3 storage helpers
```

## 🔑 Key Components

### Profile Management
- Automatic profile initialization for new users
- Metabolic health tracking (obesity, diabetes, NAFLD)
- Activity level and lifestyle factors
- Goal setting and target dates

### Dietary Tracking
- Search 300,000+ foods via Spoonacular API
- Detailed nutrition information (calories, macros, fiber)
- Meal categorization (breakfast, lunch, dinner, snacks)
- Serving size adjustments
- "Log Again" quick re-logging for frequent foods

### Nutrition Analytics
- Daily calorie and macro tracking
- Visual progress charts
- Personalized nutrition goals based on:
  - Current weight and target weight
  - Height, age, gender
  - Activity level
  - Weight loss goals

### Weight Loss Research (Enhanced)
- **Instant Loading** - Research cached in database for immediate access (no 30-60 second wait)
- **Visible Tab Labels** - Clear text labels on all research categories (mobile-friendly)
- **Research History** - Automatic saving of all generated research with timestamps
- **Category Filtering** - Filter history by research type (Overview, GLP-1, Fasting, etc.)
- **Latest Timestamp** - Shows when research was last generated
- 6 research categories with comprehensive content:
  - Overview of 2024-2025 breakthroughs (Retatrutide 24.2% weight loss, oral GLP-1 drugs)
  - GLP-1 medications and clinical trials (SURMOUNT-5, ACHIEVE-1, EQUATE-2)
  - Intermittent fasting science and protocols
  - Nutrition strategies and dietary approaches
  - Exercise research and physical activity
  - Metabolic health mechanisms (mitochondrial function, NAD+ levels)

## 🚀 Deployment

The app is designed to be deployed on platforms supporting Node.js applications:
- **Manus Platform** (recommended) - Built-in hosting with custom domain support
- Vercel
- Railway
- Render
- AWS/Azure/GCP

Ensure environment variables are properly configured in your deployment platform.

### PWA Installation
Once deployed, users can install MetaBalance as a Progressive Web App:
1. Visit the app URL in a modern browser
2. Click the "Install" button in the app or browser prompt
3. App will be added to home screen (mobile) or applications folder (desktop)
4. Enjoy native app experience with offline support

## 🎨 Design Features

- **Custom App Icon** - AI-generated heartbeat/pulse motif with teal gradient
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark Theme** - Professional dark mode with teal accent colors
- **Accessible** - Keyboard navigation, focus states, semantic HTML
- **Fast Loading** - Optimized bundle size with smart caching strategies

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a personal health application. Contributions are not currently accepted.

## 📧 Contact

For questions or support, please contact the repository owner.

## 🙏 Acknowledgments

- **Spoonacular API** - Comprehensive food and nutrition database
- **xAI Grok** - Advanced AI language model for coaching and research
- **shadcn/ui** - Beautiful and accessible component library
- **Manus Platform** - Development and deployment infrastructure

---

**Disclaimer**: This application is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals before making changes to your diet, exercise routine, or medication regimen.
