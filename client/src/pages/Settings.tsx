import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Loader2, Calculator } from "lucide-react";

interface UserSettings {
  id: string;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  gender: string | null;
  activityLevel: string | null;
  targetWeight: number | null;
  startWeight: number | null;
  heightInches: number | null;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  preferredFastingProtocol: string;
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateNutrition(
  weight: number,
  heightInches: number,
  age: number,
  gender: string,
  activityLevel: string,
  targetWeight: number
): { calories: number; protein: number; carbs: number; fat: number } {
  const heightCm = heightInches * 2.54;
  const weightKg = weight * 0.453592;
  const targetWeightKg = targetWeight * 0.453592;
  
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  let tdee = Math.round(bmr * multiplier);
  
  if (targetWeight < weight) {
    tdee = Math.round(tdee * 0.8);
  } else if (targetWeight > weight) {
    tdee = Math.round(tdee * 1.1);
  }
  
  const protein = Math.round(targetWeightKg * 2.2);
  const fat = Math.round((tdee * 0.25) / 9);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbCalories = tdee - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);
  
  return { calories: tdee, protein, carbs, fat };
}

export default function Settings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<UserSettings>>({});

  const { data: user, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user"],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel || "moderate",
        targetWeight: user.targetWeight,
        startWeight: user.startWeight,
        heightInches: user.heightInches,
        dailyCalorieTarget: user.dailyCalorieTarget,
        dailyProteinTarget: user.dailyProteinTarget,
        dailyCarbsTarget: user.dailyCarbsTarget,
        dailyFatTarget: user.dailyFatTarget,
        preferredFastingProtocol: user.preferredFastingProtocol,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      return apiRequest("PATCH", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof UserSettings, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculateNutrition = () => {
    const { startWeight, heightInches, age, gender, activityLevel, targetWeight } = formData;
    
    if (!startWeight || !heightInches || !age || !gender || !activityLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in your weight, height, age, gender, and activity level to calculate recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    const result = calculateNutrition(
      startWeight,
      heightInches,
      age,
      gender,
      activityLevel,
      targetWeight || startWeight
    );
    
    setFormData((prev) => ({
      ...prev,
      dailyCalorieTarget: result.calories,
      dailyProteinTarget: result.protein,
      dailyCarbsTarget: result.carbs,
      dailyFatTarget: result.fat,
    }));
    
    toast({
      title: "Nutrition Calculated",
      description: `Recommended: ${result.calories} calories, ${result.protein}g protein, ${result.carbs}g carbs, ${result.fat}g fat`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => handleChange("age", parseInt(e.target.value) || null)}
                  placeholder="30"
                  data-testid="input-age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={formData.activityLevel || "moderate"}
                  onValueChange={(value) => handleChange("activityLevel", value)}
                >
                  <SelectTrigger data-testid="select-activity">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light Exercise</SelectItem>
                    <SelectItem value="moderate">Moderate Exercise</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heightFeet">Height (feet)</Label>
                <Input
                  id="heightFeet"
                  type="number"
                  value={formData.heightInches ? Math.floor(formData.heightInches / 12) : ""}
                  onChange={(e) => {
                    const feet = parseInt(e.target.value) || 0;
                    const inches = (formData.heightInches || 0) % 12;
                    handleChange("heightInches", feet * 12 + inches);
                  }}
                  placeholder="5"
                  data-testid="input-height-feet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightInches">Height (inches)</Label>
                <Input
                  id="heightInches"
                  type="number"
                  value={formData.heightInches ? formData.heightInches % 12 : ""}
                  onChange={(e) => {
                    const inches = parseInt(e.target.value) || 0;
                    const feet = Math.floor((formData.heightInches || 0) / 12);
                    handleChange("heightInches", feet * 12 + inches);
                  }}
                  placeholder="10"
                  data-testid="input-height-inches"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startWeight">Current Weight (lbs)</Label>
                <Input
                  id="startWeight"
                  type="number"
                  value={formData.startWeight || ""}
                  onChange={(e) => handleChange("startWeight", parseFloat(e.target.value) || 0)}
                  placeholder="200"
                  data-testid="input-start-weight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={formData.targetWeight || ""}
                  onChange={(e) => handleChange("targetWeight", parseFloat(e.target.value) || 0)}
                  placeholder="165"
                  data-testid="input-target-weight"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Daily Nutrition Targets</CardTitle>
              <CardDescription>Set your daily nutrition goals or calculate based on your profile</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculateNutrition}
              data-testid="button-calculate"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Daily Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.dailyCalorieTarget || ""}
                  onChange={(e) => handleChange("dailyCalorieTarget", parseInt(e.target.value) || 0)}
                  placeholder="2000"
                  data-testid="input-calories"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={formData.dailyProteinTarget || ""}
                  onChange={(e) => handleChange("dailyProteinTarget", parseInt(e.target.value) || 0)}
                  placeholder="120"
                  data-testid="input-protein"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={formData.dailyCarbsTarget || ""}
                  onChange={(e) => handleChange("dailyCarbsTarget", parseInt(e.target.value) || 0)}
                  placeholder="200"
                  data-testid="input-carbs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={formData.dailyFatTarget || ""}
                  onChange={(e) => handleChange("dailyFatTarget", parseInt(e.target.value) || 0)}
                  placeholder="65"
                  data-testid="input-fat"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fasting Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="fasting">Preferred Fasting Protocol</Label>
              <Select
                value={formData.preferredFastingProtocol || "16:8"}
                onValueChange={(value) => handleChange("preferredFastingProtocol", value)}
              >
                <SelectTrigger data-testid="select-fasting-protocol">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:8">16:8 (16 hour fast)</SelectItem>
                  <SelectItem value="18:6">18:6 (18 hour fast)</SelectItem>
                  <SelectItem value="20:4">20:4 (20 hour fast)</SelectItem>
                  <SelectItem value="OMAD">OMAD (One meal a day)</SelectItem>
                  <SelectItem value="5:2">5:2 (5 days eat, 2 days fast)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-save-settings">
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
