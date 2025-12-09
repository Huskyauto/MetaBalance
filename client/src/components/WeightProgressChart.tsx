import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DataPoint {
  date: string;
  weight: number;
}

interface WeightProgressChartProps {
  data: DataPoint[];
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
}

export function WeightProgressChart({
  data,
  currentWeight,
  targetWeight,
  startWeight,
}: WeightProgressChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const totalLoss = startWeight - currentWeight;
  const goalLoss = startWeight - targetWeight;
  const progressPercent = Math.min((totalLoss / goalLoss) * 100, 100);

  const minWeight = Math.min(...data.map(d => d.weight), targetWeight) - 5;
  const maxWeight = Math.max(...data.map(d => d.weight)) + 5;
  const range = maxWeight - minWeight;

  const getY = (weight: number) => {
    return 100 - ((weight - minWeight) / range) * 100;
  };

  const pathData = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = getY(point.weight);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg font-semibold">Weight Progress</CardTitle>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              data-testid={`button-range-${range}`}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <p className="text-2xl font-bold">{currentWeight}</p>
            <p className="text-xs text-muted-foreground">Current (lbs)</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <p className="text-2xl font-bold text-green-500">-{totalLoss.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Lost (lbs)</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <p className="text-2xl font-bold text-primary">{targetWeight}</p>
            <p className="text-xs text-muted-foreground">Target (lbs)</p>
          </div>
        </div>

        <div className="relative h-48 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1={getY(targetWeight)}
              x2="100"
              y2={getY(targetWeight)}
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              strokeDasharray="2"
            />
            <path
              d={`${pathData} L 100 100 L 0 100 Z`}
              fill="url(#chartGradient)"
            />
            <path
              d={pathData}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            {data.map((point, i) => (
              <circle
                key={i}
                cx={(i / (data.length - 1)) * 100}
                cy={getY(point.weight)}
                r="1.5"
                fill="hsl(var(--primary))"
              />
            ))}
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Progress to goal</span>
            <span className="font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
