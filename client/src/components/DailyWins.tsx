import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Utensils, Drumstick, Timer, Dumbbell, Droplets } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  rating?: number;
}

interface DailyGoalsResponse {
  date: string;
  goals: Goal[];
}

const goalIcons: Record<string, React.ReactNode> = {
  "1": <Utensils className="h-4 w-4" />,
  "2": <Droplets className="h-4 w-4" />,
  "3": <Timer className="h-4 w-4" />,
  "4": <Drumstick className="h-4 w-4" />,
  "5": <Dumbbell className="h-4 w-4" />,
};

export function DailyWins() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, isLoading } = useQuery<DailyGoalsResponse>({
    queryKey: ["/api/goals", today],
  });

  const updateGoals = useMutation({
    mutationFn: async (goals: Goal[]) => {
      return apiRequest("PUT", `/api/goals/${today}`, { goals });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
  });

  const toggleGoal = (goalId: string) => {
    if (!data?.goals) return;
    
    const updatedGoals = data.goals.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    updateGoals.mutate(updatedGoals);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded-full" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const goals = data?.goals || [];
  const completedCount = goals.filter(g => g.completed).length;

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
              disabled={updateGoals.isPending}
              data-testid={`checkbox-${goal.id}`}
            />
            <div className={`${goal.completed ? "text-primary" : "text-muted-foreground"}`}>
              {goalIcons[goal.id] || <Star className="h-4 w-4" />}
            </div>
            <span className={`flex-1 text-sm ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
              {goal.text}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
