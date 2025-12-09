import { ResearchHub } from "@/components/ResearchHub";

export function Research() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weight Loss Research</h1>
        <p className="text-muted-foreground">Latest scientific findings and clinical trials (2024-2025)</p>
      </div>

      <ResearchHub />
    </div>
  );
}
