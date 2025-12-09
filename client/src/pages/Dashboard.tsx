import { MetricCard } from "@/components/MetricCard";
import { DailyWins } from "@/components/DailyWins";
import { StreakCounter } from "@/components/StreakCounter";
import { NutritionProgress } from "@/components/NutritionProgress";
import { WeightProgressChart } from "@/components/WeightProgressChart";
import { Scale, Flame, Target, Calendar } from "lucide-react";

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

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Alex</h1>
        <p className="text-muted-foreground">Here's your health overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Weight"
          value="185.2"
          unit="lbs"
          trend="down"
          trendValue="-2.3 lbs this week"
          icon={<Scale className="h-6 w-6" />}
        />
        <MetricCard
          title="Calories Today"
          value="1,450"
          unit="kcal"
          trend="neutral"
          trendValue="550 remaining"
          icon={<Flame className="h-6 w-6" />}
        />
        <MetricCard
          title="Target Weight"
          value="165"
          unit="lbs"
          trend="up"
          trendValue="20.2 lbs to go"
          icon={<Target className="h-6 w-6" />}
        />
        <MetricCard
          title="Days Active"
          value="45"
          unit="days"
          trend="up"
          trendValue="+7 this week"
          icon={<Calendar className="h-6 w-6" />}
        />
      </div>

      <StreakCounter currentStreak={12} longestStreak={21} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyWins />
        <NutritionProgress
          calories={{ current: 1450, target: 2000 }}
          nutrients={[
            { name: "Protein", current: 95, target: 120, unit: "g", color: "text-blue-500" },
            { name: "Carbs", current: 150, target: 200, unit: "g", color: "text-green-500" },
            { name: "Fat", current: 55, target: 65, unit: "g", color: "text-yellow-500" },
          ]}
        />
      </div>

      <WeightProgressChart
        data={mockWeightData}
        currentWeight={185.2}
        targetWeight={165}
        startWeight={200}
      />
    </div>
  );
}
