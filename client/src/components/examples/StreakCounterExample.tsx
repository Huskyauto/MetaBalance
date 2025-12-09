import { StreakCounter } from "../StreakCounter";

export default function StreakCounterExample() {
  return (
    <div className="p-4 max-w-md">
      <StreakCounter currentStreak={12} longestStreak={21} />
    </div>
  );
}
