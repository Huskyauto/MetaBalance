import { NutritionProgress } from "../NutritionProgress";

export default function NutritionProgressExample() {
  return (
    <div className="p-4 max-w-md">
      <NutritionProgress
        calories={{ current: 1450, target: 2000 }}
        nutrients={[
          { name: "Protein", current: 95, target: 120, unit: "g", color: "text-blue-500" },
          { name: "Carbs", current: 150, target: 200, unit: "g", color: "text-green-500" },
          { name: "Fat", current: 55, target: 65, unit: "g", color: "text-yellow-500" },
        ]}
      />
    </div>
  );
}
