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

interface FoodSearchProps {
  onAddFood?: (food: FoodItem) => void;
}

export function FoodSearch({ onAddFood }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/food/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Failed to search");
      }
      const data = await response.json();
      setResults(data.results.map((item: any) => ({
        ...item,
        id: String(item.id),
      })));
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
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
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a food..."
              className="pl-9"
              data-testid="input-food-search"
            />
          </div>
          <Button type="submit" disabled={!query.trim() || isSearching} data-testid="button-search">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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
