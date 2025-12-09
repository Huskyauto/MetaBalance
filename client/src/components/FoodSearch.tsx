import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Loader2 } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

// todo: remove mock functionality
const mockFoods: FoodItem[] = [
  { id: "1", name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: "100g" },
  { id: "2", name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, servingSize: "1 cup" },
  { id: "3", name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: "1/2 fruit" },
  { id: "4", name: "Greek Yogurt (Plain)", calories: 100, protein: 17, carbs: 6, fat: 0.7, servingSize: "170g" },
  { id: "5", name: "Salmon Fillet", calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: "100g" },
  { id: "6", name: "Broccoli (Steamed)", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, servingSize: "1 cup" },
];

interface FoodSearchProps {
  onAddFood?: (food: FoodItem) => void;
}

export function FoodSearch({ onAddFood }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FoodItem[]>([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // todo: remove mock functionality - simulate API call
    setTimeout(() => {
      const filtered = mockFoods.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.length > 0 ? filtered : mockFoods.slice(0, 3));
      setIsSearching(false);
    }, 500);
  };

  const handleAdd = (food: FoodItem) => {
    console.log("Adding food:", food);
    onAddFood?.(food);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Search Foods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for a food..."
              className="pl-9"
              data-testid="input-food-search"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} data-testid="button-search">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {results.length > 0 && (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {results.map((food) => (
                <div
                  key={food.id}
                  className="flex items-start justify-between gap-4 p-3 rounded-md bg-muted/50 hover-elevate"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.servingSize}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {food.calories} kcal
                      </Badge>
                      <Badge variant="outline" className="text-xs text-blue-500">
                        P: {food.protein}g
                      </Badge>
                      <Badge variant="outline" className="text-xs text-green-500">
                        C: {food.carbs}g
                      </Badge>
                      <Badge variant="outline" className="text-xs text-yellow-500">
                        F: {food.fat}g
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAdd(food)}
                    data-testid={`button-add-${food.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
