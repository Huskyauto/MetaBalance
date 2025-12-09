import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/MetricCard";
import { DailyWins } from "@/components/DailyWins";
import { StreakCounter } from "@/components/StreakCounter";
import { NutritionProgress } from "@/components/NutritionProgress";
import { WeightProgressChart } from "@/components/WeightProgressChart";
import { Scale, Flame, Target, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  user: {
    name: string;
    targetWeight: number;
    startWeight: number;
    dailyCalorieTarget: number;
    dailyProteinTarget: number;
    dailyCarbsTarget: number;
    dailyFatTarget: number;
  };
  currentWeight: number;
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  nutrition: {
    current: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    targets: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  weightHistory: Array<{
    date: string;
    weight: number;
  }>;
  daysActive: number;
}

export function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  const weightToGo = data.currentWeight - data.user.targetWeight;
  const caloriesRemaining = data.nutrition.targets.calories - data.nutrition.current.calories;

  // Format weight history for chart
  const weightChartData = data.weightHistory.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-welcome">Welcome back, {data.user.name}</h1>
        <p className="text-muted-foreground">Here's your health overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Weight"
          value={data.currentWeight.toFixed(1)}
          unit="lbs"
          trend={data.currentWeight < data.user.startWeight ? "down" : "neutral"}
          trendValue={`${(data.user.startWeight - data.currentWeight).toFixed(1)} lbs lost`}
          icon={<Scale className="h-6 w-6" />}
        />
        <MetricCard
          title="Calories Today"
          value={data.nutrition.current.calories.toLocaleString()}
          unit="kcal"
          trend={caloriesRemaining > 0 ? "neutral" : "up"}
          trendValue={caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : "Target reached"}
          icon={<Flame className="h-6 w-6" />}
        />
        <MetricCard
          title="Target Weight"
          value={data.user.targetWeight.toString()}
          unit="lbs"
          trend="up"
          trendValue={`${weightToGo.toFixed(1)} lbs to go`}
          icon={<Target className="h-6 w-6" />}
        />
        <MetricCard
          title="Days Active"
          value={data.daysActive.toString()}
          unit="days"
          trend="up"
          trendValue="Keep it up!"
          icon={<Calendar className="h-6 w-6" />}
        />
      </div>

      <StreakCounter 
        currentStreak={data.streak.currentStreak} 
        longestStreak={data.streak.longestStreak} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyWins />
        <NutritionProgress
          calories={{ 
            current: data.nutrition.current.calories, 
            target: data.nutrition.targets.calories 
          }}
          nutrients={[
            { 
              name: "Protein", 
              current: Math.round(data.nutrition.current.protein), 
              target: data.nutrition.targets.protein, 
              unit: "g", 
              color: "text-blue-500" 
            },
            { 
              name: "Carbs", 
              current: Math.round(data.nutrition.current.carbs), 
              target: data.nutrition.targets.carbs, 
              unit: "g", 
              color: "text-green-500" 
            },
            { 
              name: "Fat", 
              current: Math.round(data.nutrition.current.fat), 
              target: data.nutrition.targets.fat, 
              unit: "g", 
              color: "text-yellow-500" 
            },
          ]}
        />
      </div>

      <WeightProgressChart
        data={weightChartData.length > 0 ? weightChartData : [{ date: "Today", weight: data.currentWeight }]}
        currentWeight={data.currentWeight}
        targetWeight={data.user.targetWeight}
        startWeight={data.user.startWeight}
      />
    </div>
  );
}
