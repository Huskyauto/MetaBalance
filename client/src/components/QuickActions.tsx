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
import { Plus, Utensils, Scale, Dumbbell } from "lucide-react";
import { useState } from "react";

export function QuickActions() {
  const [logMealOpen, setLogMealOpen] = useState(false);
  const [logWeightOpen, setLogWeightOpen] = useState(false);
  const [logExerciseOpen, setLogExerciseOpen] = useState(false);

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
              <Input id="weight" type="number" step="0.1" placeholder="185.5" data-testid="input-weight" />
            </div>
            <Button className="w-full" onClick={() => setLogWeightOpen(false)} data-testid="button-save-weight">
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
              <Label htmlFor="food-search">Search Food</Label>
              <Input id="food-search" placeholder="Search for a food..." data-testid="input-food-search" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select>
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
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" type="number" step="0.5" defaultValue="1" data-testid="input-servings" />
            </div>
            <Button className="w-full" onClick={() => setLogMealOpen(false)} data-testid="button-save-meal">
              Add to Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
