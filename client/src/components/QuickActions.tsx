import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Utensils, Scale, Dumbbell, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const [logMealOpen, setLogMealOpen] = useState(false);
  const [logWeightOpen, setLogWeightOpen] = useState(false);
  const [logExerciseOpen, setLogExerciseOpen] = useState(false);
  const { toast } = useToast();

  const [weight, setWeight] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<string>("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const weightMutation = useMutation({
    mutationFn: async (weightValue: number) => {
      const today = new Date().toISOString().split('T')[0];
      await apiRequest("POST", "/api/weight-logs", {
        weight: weightValue,
        date: today,
      });
      await apiRequest("POST", "/api/streak/update", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weight-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/streak'] });
      toast({
        title: "Weight logged",
        description: "Your weight has been recorded successfully.",
      });
      setWeight("");
      setLogWeightOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log weight. Please try again.",
        variant: "destructive",
      });
    },
  });

  const mealMutation = useMutation({
    mutationFn: async (mealData: {
      name: string;
      mealType: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }) => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      await apiRequest("POST", "/api/meals", {
        ...mealData,
        date: today,
        time,
        servingSize: "1 serving",
      });
      await apiRequest("POST", "/api/streak/update", {});
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['/api/meals', today] });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition', today] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/streak'] });
      toast({
        title: "Meal logged",
        description: "Your meal has been recorded successfully.",
      });
      setMealName("");
      setMealType("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setLogMealOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveWeight = () => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight.",
        variant: "destructive",
      });
      return;
    }
    weightMutation.mutate(weightValue);
  };

  const handleSaveMeal = () => {
    if (!mealName.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a meal name.",
        variant: "destructive",
      });
      return;
    }
    if (!mealType) {
      toast({
        title: "Missing meal type",
        description: "Please select a meal type.",
        variant: "destructive",
      });
      return;
    }
    
    const caloriesValue = parseInt(calories) || 0;
    
    mealMutation.mutate({
      name: mealName.trim(),
      mealType,
      calories: caloriesValue,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <Dialog open={logExerciseOpen} onOpenChange={setLogExerciseOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg"
            data-testid="button-log-exercise"
          >
            <Dumbbell className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-type">Exercise Type</Label>
              <Select>
                <SelectTrigger data-testid="select-exercise-type">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" placeholder="30" data-testid="input-exercise-duration" />
            </div>
            <Button className="w-full" onClick={() => setLogExerciseOpen(false)} data-testid="button-save-exercise">
              Save Exercise
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logWeightOpen} onOpenChange={setLogWeightOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg"
            data-testid="button-log-weight"
          >
            <Scale className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Weight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input 
                id="weight" 
                type="number" 
                step="0.1" 
                placeholder="185.5" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                data-testid="input-weight" 
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSaveWeight} 
              disabled={weightMutation.isPending}
              data-testid="button-save-weight"
            >
              {weightMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Weight
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logMealOpen} onOpenChange={setLogMealOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            data-testid="button-log-meal"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Log Meal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Food Name</Label>
              <Input 
                id="meal-name" 
                placeholder="e.g., Grilled Chicken Salad" 
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                data-testid="input-food-name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger data-testid="select-meal-type">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input 
                id="calories" 
                type="number" 
                placeholder="e.g., 350" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                data-testid="input-calories" 
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input 
                  id="protein" 
                  type="number" 
                  placeholder="25" 
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  data-testid="input-protein" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input 
                  id="carbs" 
                  type="number" 
                  placeholder="30" 
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  data-testid="input-carbs" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input 
                  id="fat" 
                  type="number" 
                  placeholder="15" 
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  data-testid="input-fat" 
                />
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleSaveMeal}
              disabled={mealMutation.isPending}
              data-testid="button-save-meal"
            >
              {mealMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add to Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
