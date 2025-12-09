import { WeightProgressChart } from "../WeightProgressChart";

// todo: remove mock functionality
const mockData = [
  { date: "Nov 1", weight: 195 },
  { date: "Nov 5", weight: 193.5 },
  { date: "Nov 10", weight: 192 },
  { date: "Nov 15", weight: 191.2 },
  { date: "Nov 20", weight: 189.5 },
  { date: "Nov 25", weight: 188.3 },
  { date: "Dec 1", weight: 186.8 },
  { date: "Dec 5", weight: 185.2 },
];

export default function WeightProgressChartExample() {
  return (
    <div className="p-4 max-w-2xl">
      <WeightProgressChart
        data={mockData}
        currentWeight={185.2}
        targetWeight={165}
        startWeight={200}
      />
    </div>
  );
}
