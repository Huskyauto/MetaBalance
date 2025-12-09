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

function App() {
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="container mx-auto max-w-7xl px-4 py-6">
            {renderPage()}
          </main>
          <QuickActions />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
