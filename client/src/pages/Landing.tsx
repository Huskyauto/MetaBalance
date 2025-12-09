import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Activity, LineChart, Timer, Bot, Utensils, ArrowRight } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">MetaBalance</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login-header">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-12">
        <section className="text-center py-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Your Personal Health Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track your nutrition, manage fasting protocols, and get AI-powered coaching to achieve your wellness goals.
          </p>
          <Button size="lg" asChild data-testid="button-get-started">
            <a href="/api/login" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </section>

        <section className="py-12">
          <h2 className="text-2xl font-semibold text-center mb-8">Everything you need to succeed</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Dietary Tracking</CardTitle>
                <CardDescription>
                  Log meals and track your macros with our comprehensive food database.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Fasting Timer</CardTitle>
                <CardDescription>
                  Choose from multiple fasting protocols and track your fasting windows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Progress Charts</CardTitle>
                <CardDescription>
                  Visualize your weight loss journey with detailed progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">AI Coach</CardTitle>
                <CardDescription>
                  Get personalized guidance and motivation from your AI wellness coach.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
