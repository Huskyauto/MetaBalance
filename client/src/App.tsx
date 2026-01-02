import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { QuickActions } from "@/components/QuickActions";
import { Dashboard } from "@/pages/Dashboard";
import { DietaryTracking } from "@/pages/DietaryTracking";
import { Progress } from "@/pages/Progress";
import { Fasting } from "@/pages/Fasting";
import { Coach } from "@/pages/Coach";
import { Research } from "@/pages/Research";
import Settings from "@/pages/Settings";
import { Landing } from "@/pages/Landing";
import { useAuth } from "@/hooks/useAuth";

function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "dietary":
        return <DietaryTracking />;
      case "progress":
        return <Progress />;
      case "fasting":
        return <Fasting />;
      case "coach":
        return <Coach />;
      case "research":
        return <Research />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {renderPage()}
      </main>
      {currentPage !== "coach" && <QuickActions />}
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
