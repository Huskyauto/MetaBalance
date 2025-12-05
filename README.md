# MetaBalance

**Personalized Metabolic Health App for Obesity Reversal and Weight Loss**

MetaBalance is a comprehensive web application designed to help individuals achieve sustainable weight loss and metabolic health through evidence-based strategies, AI coaching, and personalized tracking.

## 🎯 Features

### Core Functionality
- **Profile Management** - Track current weight, target weight, metabolic conditions, and health goals
- **Dietary Tracking** - Log meals with detailed nutrition information powered by Spoonacular API
- **Nutrition Analytics** - Visualize daily macros, calories, and progress toward nutrition goals
- **Intermittent Fasting Coach** - Track fasting windows and schedules
- **Supplement Library** - Manage supplement regimens with evidence-based information
- **Progress Tracking** - Monitor weight loss journey with visual charts and statistics
- **AI Health Coach** - Get personalized advice powered by Grok AI
- **Education Hub** - Learn about metabolic health, obesity reversal, and lifestyle strategies
- **Weight Loss Research** - Access latest scientific findings and clinical trials (2024-2025)

### AI-Powered Features
- **Daily Insights** - Personalized motivational messages and health tips
- **Conversational AI Coach** - Context-aware health coaching with chat history
- **Research Summaries** - Grok AI generates comprehensive research content on:
  - GLP-1 medications (Semaglutide, Tirzepatide, emerging drugs)
  - Intermittent fasting protocols
  - Nutrition science and dietary strategies
  - Exercise and physical activity research
  - Metabolic health and cellular mechanisms

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Data fetching and caching

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
- 24 tests across 8 test files
- Profile management and initialization
- Meal logging and nutrition tracking
- API integrations (Spoonacular, Grok)
- Authentication flows

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

### Weight Loss Research
- AI-generated research summaries updated with latest findings
- 6 research categories:
  - Overview of 2024-2025 breakthroughs
  - GLP-1 medications and clinical trials
  - Intermittent fasting science
  - Nutrition strategies
  - Exercise research
  - Metabolic health mechanisms

## 🚀 Deployment

The app is designed to be deployed on platforms supporting Node.js applications:
- Vercel
- Railway
- Render
- AWS/Azure/GCP

Ensure environment variables are properly configured in your deployment platform.

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
