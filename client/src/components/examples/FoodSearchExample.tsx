import { FoodSearch } from "../FoodSearch";

export default function FoodSearchExample() {
  return (
    <div className="p-4 max-w-md">
      <FoodSearch onAddFood={(food) => console.log("Added:", food)} />
    </div>
  );
}
