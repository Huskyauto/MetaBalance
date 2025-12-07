import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Star, CheckCircle2, Circle } from "lucide-react";
import { useEffect } from "react";

export function DailyWins() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: dailyGoal, refetch } = trpc.dailyGoals.get.useQuery({ date: today });
  const updateGoal = trpc.dailyGoals.update.useMutation({
    onSuccess: () => refetch(),
  });

  // Auto-calculate goals based on user activity
  useEffect(() => {
    // This will be triggered by other features (meal logging, fasting, etc.)
    // For now, we'll just fetch the current state
  }, []);

  const goals = [
    {
      id: "mealLogging",
      label: "Log 3+ Meals",
      completed: dailyGoal?.mealLoggingComplete || false,
      description: "Track breakfast, lunch, and dinner",
    },
    {
      id: "protein",
      label: "Hit Protein Goal",
      completed: dailyGoal?.proteinGoalComplete || false,
      description: "Meet your daily protein target",
    },
    {
      id: "fasting",
      label: "Complete Fast",
      completed: dailyGoal?.fastingGoalComplete || false,
      description: "Finish your fasting window",
    },
    {
      id: "exercise",
      label: "Log Exercise",
      completed: dailyGoal?.exerciseGoalComplete || false,
      description: "Record any physical activity",
    },
    {
      id: "water",
      label: "Drink Water",
      completed: dailyGoal?.waterGoalComplete || false,
      description: "Stay hydrated (8+ glasses)",
    },
  ];

  const winScore = dailyGoal?.winScore || 0;
  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border-teal-200 dark:border-teal-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
            Today's Wins
          </h3>
          <p className="text-sm text-teal-700 dark:text-teal-300">
            {completedCount} of 5 goals completed
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= winScore
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 hover:bg-white/80 dark:hover:bg-gray-900/60 transition-colors"
          >
            {goal.completed ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium ${
                  goal.completed
                    ? "text-teal-900 dark:text-teal-100 line-through"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {goal.label}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {goal.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {winScore === 5 && (
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-300 dark:border-yellow-700">
          <p className="text-center font-semibold text-yellow-900 dark:text-yellow-100">
            🎉 Perfect Day! All goals completed!
          </p>
        </div>
      )}

      {winScore >= 3 && winScore < 5 && (
        <div className="mt-4 p-3 rounded-lg bg-teal-100 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700">
          <p className="text-center font-medium text-teal-900 dark:text-teal-100">
            Great progress! Keep going! 💪
          </p>
        </div>
      )}
    </Card>
  );
}
