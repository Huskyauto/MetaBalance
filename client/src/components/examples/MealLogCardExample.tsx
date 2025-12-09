import { MealLogCard } from "../MealLogCard";

export default function MealLogCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <MealLogCard
        name="Grilled Chicken Salad"
        mealType="lunch"
        calories={420}
        protein={38}
        carbs={22}
        fat={18}
        servingSize="1 bowl"
        time="12:30 PM"
        onLogAgain={() => console.log("Log again clicked")}
      />
      <MealLogCard
        name="Greek Yogurt with Berries"
        mealType="breakfast"
        calories={180}
        protein={15}
        carbs={24}
        fat={3}
        servingSize="1 cup"
        time="8:00 AM"
        onLogAgain={() => console.log("Log again clicked")}
      />
    </div>
  );
}
