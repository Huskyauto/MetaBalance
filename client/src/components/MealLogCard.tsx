import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

interface MealLogCardProps {
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  time: string;
  onLogAgain?: () => void;
  onDelete?: () => void;
}

export function MealLogCard({
  name,
  mealType,
  calories,
  protein,
  carbs,
  fat,
  servingSize,
  time,
  onLogAgain,
  onDelete,
}: MealLogCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getMealColor = () => {
    switch (mealType) {
      case "breakfast": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "lunch": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "dinner": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "snack": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    }
  };

  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{name}</span>
              <Badge variant="secondary" className={getMealColor()}>
                {mealType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {servingSize} • {time}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold">{calories}</span>
            <span className="text-sm text-muted-foreground ml-1">kcal</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground"
            data-testid="button-expand-meal"
          >
            {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            Details
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogAgain}
              className="text-primary"
              data-testid="button-log-again"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Log Again
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive"
                data-testid="button-delete-meal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-500">{protein}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-500">{carbs}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-500">{fat}g</p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
