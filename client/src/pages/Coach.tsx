import { AICoachChat } from "@/components/AICoachChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, TrendingUp, Heart, Zap } from "lucide-react";

// todo: remove mock functionality
const suggestedTopics = [
  { id: "1", label: "How can I break a weight loss plateau?", icon: TrendingUp },
  { id: "2", label: "Best protein sources for my diet", icon: Heart },
  { id: "3", label: "Tips for reducing cravings", icon: Zap },
  { id: "4", label: "Should I try a different fasting protocol?", icon: Lightbulb },
];

const dailyInsight = {
  title: "Your Daily Insight",
  message: "Based on your recent progress, you're on track to reach your goal by February 15th. Your protein intake has improved significantly this week - keep it up! Consider adding more fiber to help with satiety during your fasting windows.",
};

export function Coach() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          AI Health Coach
          <Sparkles className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground">Get personalized advice powered by advanced AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AICoachChat />
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {dailyInsight.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{dailyInsight.message}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggested Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedTopics.map((topic) => (
                <Button
                  key={topic.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3"
                  data-testid={`topic-${topic.id}`}
                >
                  <topic.icon className="h-4 w-4 mr-3 shrink-0 text-primary" />
                  <span className="text-sm">{topic.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-sm font-medium">Chat Sessions</span>
                <Badge variant="secondary">This Week</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Tips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
