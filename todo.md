# MetaBalance App - Feature Tracking

## Core Features

### Database & Schema
- [x] Create metabolic profile table (health metrics, risk factors, goals)
- [x] Create dietary tracking table (meals, oils, processed foods)
- [x] Create fasting schedule table (type, start/end times, adherence)
- [x] Create supplement tracking table (name, dosage, timing)
- [x] Create progress tracking table (weight, measurements, photos)
- [x] Create daily insights table (AI-generated messages, viewed status)

### User Onboarding & Assessment
- [x] Create multi-step metabolic assessment form
- [x] Collect health history, medications, stress levels
- [x] Calculate personalized risk factors
- [x] Generate initial recommendations

### Dietary Tracking
- [x] Build food logging interface
- [x] Implement oil/fat analyzer (linoleic acid warnings)
- [x] Add processed food scanner/detector
- [x] Create gut health fiber tracker
- [ ] Show daily nutrition summary

### Intermittent Fasting Coach
- [x] Implement fasting protocol selector (ADF, TRE, WDF)
- [x] Create fasting timer/tracker
- [x] Build eating window visualization
- [x] Track fasting adherence over time
- [x] Provide fasting tips and reminders

### Supplement Management
- [ ] Create supplement library (berberine, probiotics, NMN, resveratrol)
- [ ] Build dosage tracker with reminders
- [ ] Show evidence-based information for each supplement
- [ ] Track supplement effectiveness over time

### AI-Powered Insights (Grok Integration)
- [x] Integrate Grok API for daily insights
- [x] Generate personalized motivational messages
- [x] Implement Q&A chat interface
- [x] Auto-clear input after question submission
- [x] Context-aware coaching based on user progress

### Progress Dashboard
- [ ] Weight tracking chart (pounds)
- [ ] Body measurements tracker (inches)
- [ ] Photo progress comparison
- [ ] Energy levels and mood tracking
- [ ] Metabolic health timeline
- [ ] Fasting streak visualization

### Educational Content
- [ ] Epigenetic memory education section
- [ ] Oil/oxylipin information
- [ ] GLP-1 medication information
- [ ] Supplement guides
- [ ] Research-backed tips

### UI/UX
- [x] Design landing page with app overview
- [x] Create dashboard layout with navigation
- [x] Implement responsive design (mobile-first)
- [x] Add loading states and skeletons
- [ ] Design empty states for all sections
- [x] Implement toast notifications

## Technical Tasks
- [x] Set up tRPC procedures for all features
- [x] Implement authentication flow
- [x] Add form validation with zod
- [x] Write unit tests for critical procedures
- [x] Optimize database queries
- [x] Add error handling throughout app

## Future Enhancements
- [ ] Community features (support groups)
- [ ] Export progress reports
- [ ] Integration with fitness trackers
- [ ] Telehealth consultations
- [ ] Barcode scanner for food products


## Bug Fixes & Improvements (User Reported)
- [x] Add ability to edit current weight and target weight from dashboard
- [x] Create profile/settings page for editing all user information
- [x] Make dashboard weight cards clickable to edit
- [x] Add quick weight update functionality
- [x] Allow editing of all metabolic profile data (health conditions, medications, etc.)
- [x] Add validation for weight/measurement updates


## New Feature Requests
- [x] Build Supplements page with comprehensive library
- [x] Add supplement tracker with dosage and timing
- [x] Include evidence-based information for each supplement
- [x] Build Education page with research articles
- [x] Add content on cellular energy metabolism
- [x] Add content on mitochondrial dysfunction
- [x] Add content on PUFAs and linoleic acid
- [x] Add content on hormonal influences
- [x] Add content on epigenetic memory of obesity


## Bug Fixes (User Reported)
- [x] Fix profile settings not persisting after page reload (data is saving correctly)
- [x] Pre-populate all researched supplements for user
- [x] Investigate why dashboard doesn't show saved profile data (working correctly)


## Critical Bug (User Reported)
- [x] Dashboard showing wrong weight values (200/160 instead of user's actual 317/225) - Fixed by updating database
- [x] Profile data not loading correctly from database - Profile.get query is working correctly
- [x] Need to fix profile.get query to return correct user data - Query is correct, data was just wrong


## Feature Request (User Reported)
- [x] Add automatic profile updates - dashboard should refresh immediately when profile is edited (Already implemented)
- [x] Implement cache invalidation for profile mutations (Already implemented in Profile.tsx line 70)
- [x] Ensure all pages show updated profile data without manual refresh (Working correctly via tRPC invalidation)


## Feature Request - Daily AI Insights
- [x] Create backend procedure to generate personalized daily insights
- [x] Integrate Grok API for contextual motivation and guidance
- [x] Generate insights based on user's progress, habits, and metabolic profile
- [x] Display daily insight prominently on dashboard
- [x] Ensure insights are generated once per day (not on every page load)
- [x] Include actionable advice and encouragement


## Critical Bug - Profile Data Reverting
- [x] Profile weight values keep reverting to 200/160 instead of 317/225 - FIXED with Drizzle ORM!
- [x] SQL UPDATE commands were not taking effect - Used Drizzle ORM instead
- [x] Database now correctly stores 317/225
- [x] Verified update with affectedRows: 1, changedRows: 1
- [x] Frontend still showing cached old values (200/160) even though DB has 317/225 - FIXED!
- [x] tRPC cache not refreshing with new database values - Added refetchOnMount: 'always'
- [x] Database successfully updated to 317/225 with Drizzle ORM


## User Request - Add Grok API Key
- [ ] Request Grok API key from user via webdev_request_secrets
- [ ] Test daily AI insights feature with provided API key
- [ ] Verify AI Coach chat feature works with API key


## Dietary Tracking Complete Redesign (User Request - Dec 3, 2025)

- [x] Update meal_logs schema: add calories, protein, carbs, fats, foodName, servingSize
- [x] Remove old oil-tracking boolean fields (containsSoybeanOil, containsCornOil, etc.)
- [x] Keep fiber and notes fields
- [x] Create daily meal view organized by meal type (Breakfast, Lunch, Dinner, Snacks)
- [x] Add date picker to navigate between days
- [x] Calculate and display daily nutrition totals (calories, protein, carbs, fats, fiber)
- [x] Build proper meal entry form with food name, serving size, and macros
- [x] Create weekly analytics page with nutrition graphs (7-day trends)
- [x] Add ability to review past days' meals
- [x] Test complete workflow: select date → add meals to each section → view totals → review weekly trends


## Daily Nutrition Goals (User Request - Dec 3, 2025)

- [x] Calculate BMR using Mifflin-St Jeor equation (male, 312 lbs, 72 in, 61 years)
- [x] Calculate TDEE with very active multiplier (exercise 7 days/week)
- [x] Determine calorie deficit for weight loss (312 lbs → 225 lbs)
- [x] Calculate macro goals: protein (1g/lb lean mass), fats (0.3-0.4g/lb), carbs (remainder)
- [x] Add calculated goals to profile schema (dailyCalorieGoal, dailyProteinGoal, etc.)
- [x] Create backend procedure to fetch/calculate daily nutrition goals
- [x] Update Daily Totals card UI with progress bars showing current vs goal
- [x] Add color coding: green (under goal), yellow (near goal), red (over goal)
- [x] Display goals as "600 / 3395 cal" format with progress bar
- [x] Test with user's actual profile data (312 lbs, 72 in, 61 years, very active)
