import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Pill, Timer, Apple, Dumbbell, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const researchCategories = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "glp1", label: "GLP-1", icon: Pill },
  { id: "fasting", label: "Fasting", icon: Timer },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "exercise", label: "Exercise", icon: Dumbbell },
  { id: "metabolic", label: "Metabolic", icon: Activity },
];

// todo: remove mock functionality
const mockResearch = {
  overview: {
    title: "2024-2025 Weight Loss Breakthroughs",
    lastUpdated: "Dec 7, 2025",
    content: `
## Major Findings

### Retatrutide Shows 24.2% Weight Loss
The triple agonist Retatrutide (GIP/GLP-1/Glucagon) achieved unprecedented results in Phase 3 trials, with participants losing an average of 24.2% body weight over 48 weeks.

### Oral GLP-1 Drugs Coming to Market
Orforglipron and oral semaglutide tablets are showing comparable efficacy to injectable forms, potentially increasing accessibility.

### Time-Restricted Eating Validated
Multiple studies confirm that 16:8 intermittent fasting provides metabolic benefits independent of caloric restriction, including improved insulin sensitivity and autophagy markers.

### Metabolic Adaptation Research
New understanding of how the body adapts to weight loss is informing better maintenance strategies, with focus on preserving lean mass during deficit.
    `,
  },
  glp1: {
    title: "GLP-1 Medications Research",
    lastUpdated: "Dec 6, 2025",
    content: `
## Latest GLP-1 Research

### SURMOUNT-5 Trial Results
Tirzepatide showed 20.2% weight loss at highest dose, with significant improvements in cardiovascular risk factors.

### ACHIEVE-1 Study
Orforglipron demonstrated 14.7% weight loss as an oral alternative to injectable GLP-1 medications.

### Muscle Preservation Strategies
New research combining GLP-1 agonists with resistance training shows potential to minimize muscle loss during rapid weight reduction.

### Long-term Safety Data
5-year follow-up studies show sustained weight maintenance and continued metabolic improvements in patients remaining on therapy.
    `,
  },
  fasting: {
    title: "Intermittent Fasting Science",
    lastUpdated: "Dec 5, 2025",
    content: `
## Fasting Protocols Research

### Alternate Day Fasting (ADF)
Studies show ADF can produce similar weight loss to continuous caloric restriction while potentially preserving more lean mass.

### Time-Restricted Eating (TRE)
8-hour eating windows align with circadian rhythms, improving metabolic markers even without calorie counting.

### Autophagy Activation
Fasting periods of 16+ hours consistently activate cellular cleanup mechanisms, with potential longevity benefits.

### Exercise Timing
Training in fasted states shows enhanced fat oxidation, though performance may be impacted in high-intensity activities.
    `,
  },
};

export function ResearchHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // todo: remove mock functionality
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const currentResearch = mockResearch[activeTab as keyof typeof mockResearch] || mockResearch.overview;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Weight Loss Research
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-research"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            {researchCategories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1 text-xs" data-testid={`tab-${cat.id}`}>
                <cat.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">{currentResearch.title}</h3>
                <Badge variant="secondary">Updated: {currentResearch.lastUpdated}</Badge>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {currentResearch.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return <h2 key={i} className="text-lg font-semibold mt-6 mb-3">{line.replace("## ", "")}</h2>;
                    }
                    if (line.startsWith("### ")) {
                      return <h3 key={i} className="text-base font-medium mt-4 mb-2 text-primary">{line.replace("### ", "")}</h3>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="text-sm text-muted-foreground mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
