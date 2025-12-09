import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const getMilestone = (streak: number) => {
    if (streak >= 30) return { label: "30 Days!", color: "bg-yellow-500" };
    if (streak >= 14) return { label: "2 Weeks!", color: "bg-purple-500" };
    if (streak >= 7) return { label: "1 Week!", color: "bg-blue-500" };
    if (streak >= 3) return { label: "3 Days!", color: "bg-green-500" };
    return null;
  };

  const milestone = getMilestone(currentStreak);

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
              <span className="text-4xl font-bold">{currentStreak}</span>
              <span className="text-lg text-muted-foreground">days</span>
            </div>
            {milestone && (
              <Badge className={`mt-2 ${milestone.color} text-white`}>
                {milestone.label}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Best: {longestStreak} days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
