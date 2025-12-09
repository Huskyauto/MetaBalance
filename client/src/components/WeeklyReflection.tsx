import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Star } from "lucide-react";

export function WeeklyReflection() {
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState({
    wentWell: "",
    challenges: "",
    nextWeek: "",
  });

  // todo: remove mock functionality
  const mockStats = {
    daysLogged: 5,
    avgWinScore: 3.8,
  };

  const handleSubmit = () => {
    console.log("Submitting reflection:", responses);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">AI Insights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Great progress this week! I noticed you tend to skip logging on weekends - 
              try setting a reminder for Saturday mornings. Your protein intake has improved 
              by 15% compared to last week. Keep focusing on your morning routine, as your 
              best win scores come on days when you eat breakfast within an hour of waking.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-md">
            <span className="text-sm">Days Logged</span>
            <Badge variant="secondary">{mockStats.daysLogged}/7</Badge>
          </div>
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-md">
            <span className="text-sm">Avg Win Score</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{mockStats.avgWinScore}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)} data-testid="button-new-reflection">
            Submit New Reflection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="went-well">What went well this week?</Label>
          <Textarea
            id="went-well"
            placeholder="I consistently hit my protein goals..."
            value={responses.wentWell}
            onChange={(e) => setResponses({ ...responses, wentWell: e.target.value })}
            data-testid="textarea-went-well"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="challenges">What challenges did you face?</Label>
          <Textarea
            id="challenges"
            placeholder="I struggled with late-night snacking..."
            value={responses.challenges}
            onChange={(e) => setResponses({ ...responses, challenges: e.target.value })}
            data-testid="textarea-challenges"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next-week">What's your plan for next week?</Label>
          <Textarea
            id="next-week"
            placeholder="I will prepare healthy snacks in advance..."
            value={responses.nextWeek}
            onChange={(e) => setResponses({ ...responses, nextWeek: e.target.value })}
            data-testid="textarea-next-week"
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} data-testid="button-submit-reflection">
          <Sparkles className="h-4 w-4 mr-2" />
          Get AI Insights
        </Button>
      </CardContent>
    </Card>
  );
}
