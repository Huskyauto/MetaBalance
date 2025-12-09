import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Utensils, Drumstick, Timer, Dumbbell, Droplets } from "lucide-react";

interface Goal {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
}

export function DailyWins() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "meals", label: "Log 3+ Meals", icon: <Utensils className="h-4 w-4" />, completed: true },
    { id: "protein", label: "Hit Protein Goal", icon: <Drumstick className="h-4 w-4" />, completed: true },
    { id: "fasting", label: "Complete Fast", icon: <Timer className="h-4 w-4" />, completed: false },
    { id: "exercise", label: "Log Exercise", icon: <Dumbbell className="h-4 w-4" />, completed: true },
    { id: "water", label: "Drink Water (8+ glasses)", icon: <Droplets className="h-4 w-4" />, completed: false },
  ]);

  const completedCount = goals.filter(g => g.completed).length;

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg font-semibold">Daily Wins</CardTitle>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 transition-all ${
                i < completedCount
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => toggleGoal(goal.id)}
            data-testid={`goal-${goal.id}`}
          >
            <Checkbox
              checked={goal.completed}
              onCheckedChange={() => toggleGoal(goal.id)}
              data-testid={`checkbox-${goal.id}`}
            />
            <div className={`${goal.completed ? "text-primary" : "text-muted-foreground"}`}>
              {goal.icon}
            </div>
            <span className={`flex-1 text-sm ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
              {goal.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
