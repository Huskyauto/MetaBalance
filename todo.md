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
