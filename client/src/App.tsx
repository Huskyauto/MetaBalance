import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Meals from "./pages/Meals";
import Fasting from "./pages/Fasting";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Supplements from "./pages/Supplements";
import Education from "./pages/Education";
import NutritionAnalytics from "./pages/NutritionAnalytics";
import WeightLossResearch from "./pages/WeightLossResearch";
import WeeklyReflection from "./pages/WeeklyReflection";
import Settings from "./pages/Settings";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/meals"} component={Meals} />
      <Route path={"/nutrition-analytics"} component={NutritionAnalytics} />
      <Route path={"/fasting"} component={Fasting} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/supplements"} component={Supplements} />
      <Route path={"/progress"} component={Progress} />
      <Route path={"/education"} component={Education} />
      <Route path={"/research"} component={WeightLossResearch} />
      <Route path={"/reflection"} component={WeeklyReflection} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <PWAInstallPrompt />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
