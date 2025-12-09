import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface NutrientData {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface NutritionProgressProps {
  calories: { current: number; target: number };
  nutrients: NutrientData[];
}

export function NutritionProgress({ calories, nutrients }: NutritionProgressProps) {
  const caloriePercentage = Math.min((calories.current / calories.target) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Today's Nutrition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm text-muted-foreground">
              {calories.current} / {calories.target} kcal
            </span>
          </div>
          <Progress value={caloriePercentage} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {nutrients.map((nutrient) => {
            const percentage = Math.min((nutrient.current / nutrient.target) * 100, 100);
            return (
              <div key={nutrient.name} className="text-center">
                <div className="relative w-16 h-16 mx-auto">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${percentage * 1.76} 176`}
                      className={nutrient.color}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold">{Math.round(percentage)}%</span>
                  </div>
                </div>
                <p className="text-xs font-medium mt-2">{nutrient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {nutrient.current}{nutrient.unit}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
