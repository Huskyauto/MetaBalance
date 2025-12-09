import { MetricCard } from "../MetricCard";
import { Scale, Flame, Target, Calendar } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
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
  );
}
