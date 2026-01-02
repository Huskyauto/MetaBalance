import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Pill, Timer, Apple, Dumbbell, Activity, RefreshCw, History, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const researchCategories = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "glp1", label: "GLP-1", icon: Pill },
  { id: "fasting", label: "Fasting", icon: Timer },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "exercise", label: "Exercise", icon: Dumbbell },
  { id: "metabolic", label: "Metabolic", icon: Activity },
];

const researchData = {
  overview: {
    title: "2024-2025 Weight Loss Breakthroughs",
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
  nutrition: {
    title: "Nutrition Science Updates",
    content: `
## Latest Nutrition Research

### Protein Timing Matters
New research shows distributing protein intake evenly across meals optimizes muscle protein synthesis during weight loss.

### Fiber and Satiety
High-fiber diets (30g+ daily) significantly improve satiety hormones and support sustainable calorie reduction.

### Ultra-Processed Foods Link
Strong evidence connects ultra-processed food consumption to increased calorie intake and weight gain independent of nutrient content.

### Mediterranean Diet Benefits
Continued validation of Mediterranean eating patterns for both weight management and cardiovascular health.
    `,
  },
  exercise: {
    title: "Exercise Science Updates",
    content: `
## Latest Exercise Research

### Resistance Training Priority
Studies confirm resistance training preserves muscle mass during caloric deficit better than cardio alone.

### HIIT Efficiency
High-intensity interval training shows comparable fat loss to longer steady-state sessions in less time.

### NEAT Contribution
Non-exercise activity thermogenesis (daily movement) contributes significantly to total daily energy expenditure.

### Recovery Importance
Adequate recovery between sessions optimizes metabolic adaptations and prevents overtraining.
    `,
  },
  metabolic: {
    title: "Metabolic Health Research",
    content: `
## Latest Metabolic Research

### Insulin Sensitivity
Morning exercise shows superior effects on insulin sensitivity compared to evening workouts.

### Brown Fat Activation
Cold exposure and certain compounds can activate brown adipose tissue for enhanced calorie burning.

### Gut Microbiome Role
Specific gut bacteria profiles are associated with better weight loss outcomes and metabolic health.

### Sleep Impact
Poor sleep quality directly impairs metabolic rate and increases hunger hormones.
    `,
  },
};

interface HistoryEntry {
  date: string;
  category: string;
  title: string;
  summary: string;
}

const researchHistory: HistoryEntry[] = [
  { date: "Jan 2, 2026", category: "overview", title: "Retatrutide Phase 3 Complete", summary: "Final results confirm 24.2% weight loss efficacy" },
  { date: "Dec 28, 2025", category: "glp1", title: "Oral Semaglutide FDA Update", summary: "New dosing recommendations published" },
  { date: "Dec 21, 2025", category: "fasting", title: "16:8 Protocol Meta-Analysis", summary: "Comprehensive review of 50+ studies confirms benefits" },
  { date: "Dec 15, 2025", category: "nutrition", title: "Protein Requirements Updated", summary: "Higher protein needs during active weight loss confirmed" },
  { date: "Dec 10, 2025", category: "exercise", title: "Resistance Training Guidelines", summary: "New recommendations for preserving muscle during deficit" },
  { date: "Dec 7, 2025", category: "metabolic", title: "Sleep and Metabolism Study", summary: "Sleep deprivation reduces metabolic rate by up to 5%" },
  { date: "Nov 30, 2025", category: "glp1", title: "Tirzepatide 5-Year Data", summary: "Long-term safety and efficacy data released" },
  { date: "Nov 22, 2025", category: "fasting", title: "Autophagy Markers Study", summary: "New biomarkers for measuring fasting benefits" },
];

export function ResearchHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const currentResearch = researchData[activeTab as keyof typeof researchData] || researchData.overview;
  const formattedDate = useMemo(() => format(lastRefreshed, "MMM d, yyyy"), [lastRefreshed]);

  const categoryHistory = useMemo(() => 
    researchHistory.filter(h => h.category === activeTab),
    [activeTab]
  );

  if (showHistory) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Research History
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(false)}
            data-testid="button-back-to-research"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Back to Research
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {researchHistory.map((entry, index) => {
                const category = researchCategories.find(c => c.id === entry.category);
                const Icon = category?.icon || BookOpen;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                    onClick={() => {
                      setActiveTab(entry.category);
                      setShowHistory(false);
                    }}
                    data-testid={`history-entry-${index}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{entry.title}</span>
                        <Badge variant="outline" className="text-xs capitalize">{category?.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{entry.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Weight Loss Research
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(true)}
            data-testid="button-view-history"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
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
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            {researchCategories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1 text-xs" data-testid={`tab-${cat.id}`}>
                <cat.icon className="h-3 w-3" />
                <span>{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-xl font-semibold">{currentResearch.title}</h3>
                <Badge variant="secondary">Updated: {formattedDate}</Badge>
              </div>
              
              {categoryHistory.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <History className="h-3 w-3" />
                  <span>Recent: {categoryHistory[0]?.title}</span>
                </div>
              )}
              
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
