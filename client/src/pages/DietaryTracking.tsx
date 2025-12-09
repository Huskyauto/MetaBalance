import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FoodSearch } from "@/components/FoodSearch";
import { MealLogCard } from "@/components/MealLogCard";
import { NutritionProgress } from "@/components/NutritionProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Sun, Moon, Cookie } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Meal } from "@shared/schema";

interface NutritionData {
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
}

export function DietaryTracking() {
  const [activeTab, setActiveTab] = useState("all");
  const today = new Date().toISOString().split('T')[0];

  const { data: meals = [], isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals', today],
    queryFn: async () => {
      const response = await fetch(`/api/meals?date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch meals');
      return response.json();
    },
  });

  const { data: nutritionData, isLoading: nutritionLoading } = useQuery<NutritionData>({
    queryKey: ['/api/nutrition', today],
    queryFn: async () => {
      const response = await fetch(`/api/nutrition/${today}`);
      if (!response.ok) throw new Error('Failed to fetch nutrition');
      return response.json();
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      await apiRequest("DELETE", `/api/meals/${mealId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals', today] });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition', today] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });

  const groupedMeals = {
    breakfast: meals.filter(m => m.mealType === 'breakfast'),
    lunch: meals.filter(m => m.mealType === 'lunch'),
    dinner: meals.filter(m => m.mealType === 'dinner'),
    snack: meals.filter(m => m.mealType === 'snack'),
  };

  const displayMeals = activeTab === "all" 
    ? meals 
    : groupedMeals[activeTab as keyof typeof groupedMeals] || [];

  const formatTime = (time: string | null) => {
    if (!time) return "";
    return time;
  };

  if (mealsLoading || nutritionLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dietary Tracking</h1>
          <p className="text-muted-foreground">Log and track your daily meals</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dietary Tracking</h1>
        <p className="text-muted-foreground">Log and track your daily meals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FoodSearch />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Today's Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="breakfast" className="gap-1" data-testid="tab-breakfast">
                    <Coffee className="h-3 w-3" />
                    <span className="hidden sm:inline">Breakfast</span>
                  </TabsTrigger>
                  <TabsTrigger value="lunch" className="gap-1" data-testid="tab-lunch">
                    <Sun className="h-3 w-3" />
                    <span className="hidden sm:inline">Lunch</span>
                  </TabsTrigger>
                  <TabsTrigger value="dinner" className="gap-1" data-testid="tab-dinner">
                    <Moon className="h-3 w-3" />
                    <span className="hidden sm:inline">Dinner</span>
                  </TabsTrigger>
                  <TabsTrigger value="snack" className="gap-1" data-testid="tab-snack">
                    <Cookie className="h-3 w-3" />
                    <span className="hidden sm:inline">Snacks</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-3">
                  {displayMeals.length > 0 ? (
                    displayMeals.map((meal) => (
                      <MealLogCard
                        key={meal.id}
                        name={meal.name}
                        mealType={meal.mealType as "breakfast" | "lunch" | "dinner" | "snack"}
                        calories={meal.calories}
                        protein={meal.protein || 0}
                        carbs={meal.carbs || 0}
                        fat={meal.fat || 0}
                        servingSize={meal.servingSize || "1 serving"}
                        time={formatTime(meal.time)}
                        onLogAgain={() => console.log("Log again:", meal.name)}
                        onDelete={() => deleteMealMutation.mutate(meal.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground" data-testid="text-no-meals">
                      No meals logged yet. Start by searching for foods above.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <NutritionProgress
            calories={{ 
              current: nutritionData?.current?.calories || 0, 
              target: nutritionData?.targets?.calories || 2000 
            }}
            nutrients={[
              { 
                name: "Protein", 
                current: nutritionData?.current?.protein || 0, 
                target: nutritionData?.targets?.protein || 120, 
                unit: "g", 
                color: "text-blue-500" 
              },
              { 
                name: "Carbs", 
                current: nutritionData?.current?.carbs || 0, 
                target: nutritionData?.targets?.carbs || 200, 
                unit: "g", 
                color: "text-green-500" 
              },
              { 
                name: "Fat", 
                current: nutritionData?.current?.fat || 0, 
                target: nutritionData?.targets?.fat || 65, 
                unit: "g", 
                color: "text-yellow-500" 
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
