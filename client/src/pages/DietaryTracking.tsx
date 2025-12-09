import { useState } from "react";
import { FoodSearch } from "@/components/FoodSearch";
import { MealLogCard } from "@/components/MealLogCard";
import { NutritionProgress } from "@/components/NutritionProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Sun, Moon, Cookie } from "lucide-react";

// todo: remove mock functionality
const mockMeals = {
  breakfast: [
    { id: "1", name: "Greek Yogurt with Berries", calories: 180, protein: 15, carbs: 24, fat: 3, servingSize: "1 cup", time: "8:00 AM" },
    { id: "2", name: "Whole Grain Toast", calories: 120, protein: 4, carbs: 22, fat: 2, servingSize: "2 slices", time: "8:00 AM" },
  ],
  lunch: [
    { id: "3", name: "Grilled Chicken Salad", calories: 420, protein: 38, carbs: 22, fat: 18, servingSize: "1 bowl", time: "12:30 PM" },
  ],
  dinner: [
    { id: "4", name: "Salmon with Vegetables", calories: 480, protein: 35, carbs: 28, fat: 22, servingSize: "1 plate", time: "7:00 PM" },
  ],
  snack: [
    { id: "5", name: "Almonds", calories: 165, protein: 6, carbs: 6, fat: 14, servingSize: "1 oz", time: "3:00 PM" },
  ],
};

export function DietaryTracking() {
  const [activeTab, setActiveTab] = useState("all");

  const allMeals = [...mockMeals.breakfast, ...mockMeals.lunch, ...mockMeals.dinner, ...mockMeals.snack];
  const displayMeals = activeTab === "all" ? allMeals : mockMeals[activeTab as keyof typeof mockMeals] || [];

  const getMealType = (id: string): "breakfast" | "lunch" | "dinner" | "snack" => {
    if (mockMeals.breakfast.find(m => m.id === id)) return "breakfast";
    if (mockMeals.lunch.find(m => m.id === id)) return "lunch";
    if (mockMeals.dinner.find(m => m.id === id)) return "dinner";
    return "snack";
  };

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
                        mealType={getMealType(meal.id)}
                        calories={meal.calories}
                        protein={meal.protein}
                        carbs={meal.carbs}
                        fat={meal.fat}
                        servingSize={meal.servingSize}
                        time={meal.time}
                        onLogAgain={() => console.log("Log again:", meal.name)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
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
            calories={{ current: 1365, target: 2000 }}
            nutrients={[
              { name: "Protein", current: 98, target: 120, unit: "g", color: "text-blue-500" },
              { name: "Carbs", current: 102, target: 200, unit: "g", color: "text-green-500" },
              { name: "Fat", current: 59, target: 65, unit: "g", color: "text-yellow-500" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
