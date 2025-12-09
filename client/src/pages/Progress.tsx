import { WeightProgressChart } from "@/components/WeightProgressChart";
import { WeeklyReflection } from "@/components/WeeklyReflection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trophy, Target, TrendingDown, Calendar } from "lucide-react";

// todo: remove mock functionality
const mockWeightData = [
  { date: "Nov 1", weight: 195 },
  { date: "Nov 5", weight: 193.5 },
  { date: "Nov 10", weight: 192 },
  { date: "Nov 15", weight: 191.2 },
  { date: "Nov 20", weight: 189.5 },
  { date: "Nov 25", weight: 188.3 },
  { date: "Dec 1", weight: 186.8 },
  { date: "Dec 5", weight: 185.2 },
];

const mockAchievements = [
  { id: "1", name: "First Week", description: "Completed your first week", icon: Calendar, unlocked: true },
  { id: "2", name: "5 Day Streak", description: "Logged for 5 consecutive days", icon: Trophy, unlocked: true },
  { id: "3", name: "First 5 lbs", description: "Lost your first 5 pounds", icon: TrendingDown, unlocked: true },
  { id: "4", name: "Goal Setter", description: "Set your target weight", icon: Target, unlocked: true },
  { id: "5", name: "10 Day Streak", description: "Logged for 10 consecutive days", icon: Trophy, unlocked: true },
  { id: "6", name: "First 10 lbs", description: "Lost your first 10 pounds", icon: TrendingDown, unlocked: true },
  { id: "7", name: "30 Day Streak", description: "Logged for 30 consecutive days", icon: Trophy, unlocked: false },
  { id: "8", name: "Halfway There", description: "Reached 50% of your goal", icon: Target, unlocked: false },
];

export function Progress() {
  const handleExportPDF = () => {
    console.log("Exporting PDF report...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">Track your weight loss journey</p>
        </div>
        <Button onClick={handleExportPDF} data-testid="button-export-pdf">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeightProgressChart
            data={mockWeightData}
            currentWeight={185.2}
            targetWeight={165}
            startWeight={200}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
              <Badge variant="secondary">
                {mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length} Unlocked
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mockAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center p-4 rounded-lg text-center transition-all ${
                      achievement.unlocked
                        ? "bg-primary/10"
                        : "bg-muted/50 opacity-50 grayscale"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
                        achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <achievement.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <WeeklyReflection />
        </div>
      </div>
    </div>
  );
}
