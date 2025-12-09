import { FastingTimer } from "@/components/FastingTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Info, CheckCircle } from "lucide-react";

const fastingProtocols = [
  {
    id: "16-8",
    name: "16:8 TRE",
    description: "Time-Restricted Eating",
    fastingHours: 16,
    eatingHours: 8,
    benefits: ["Easy to follow", "Improves insulin sensitivity", "Fits most schedules"],
    recommended: true,
  },
  {
    id: "18-6",
    name: "18:6",
    description: "Extended TRE",
    fastingHours: 18,
    eatingHours: 6,
    benefits: ["Enhanced fat burning", "Deeper autophagy", "More ketosis time"],
    recommended: false,
  },
  {
    id: "adf",
    name: "ADF",
    description: "Alternate Day Fasting",
    fastingHours: 36,
    eatingHours: 12,
    benefits: ["Maximum metabolic reset", "Higher weight loss", "Improved longevity markers"],
    recommended: false,
  },
];

// todo: remove mock functionality
const recentFasts = [
  { date: "Dec 5", duration: "16:42", completed: true },
  { date: "Dec 4", duration: "15:30", completed: true },
  { date: "Dec 3", duration: "16:15", completed: true },
  { date: "Dec 2", duration: "14:45", completed: false },
  { date: "Dec 1", duration: "16:00", completed: true },
];

export function Fasting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Intermittent Fasting</h1>
        <p className="text-muted-foreground">Track your fasting windows and protocols</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FastingTimer protocol="16:8 TRE" targetHours={16} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Fasting Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {fastingProtocols.map((protocol) => (
                  <div
                    key={protocol.id}
                    className={`p-4 rounded-lg border hover-elevate cursor-pointer ${
                      protocol.recommended ? "border-primary bg-primary/5" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold">{protocol.name}</span>
                      {protocol.recommended && (
                        <Badge className="bg-primary">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{protocol.description}</p>
                    <div className="text-2xl font-bold mb-3">
                      {protocol.fastingHours}:{protocol.eatingHours}
                    </div>
                    <ul className="space-y-1">
                      {protocol.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={protocol.recommended ? "default" : "outline"}
                      size="sm"
                      className="w-full mt-4"
                      data-testid={`button-select-${protocol.id}`}
                    >
                      {protocol.recommended ? "Currently Active" : "Select Protocol"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Fasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFasts.map((fast, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{fast.date}</p>
                      <p className="text-sm text-muted-foreground">{fast.duration}</p>
                    </div>
                    <Badge variant={fast.completed ? "default" : "secondary"}>
                      {fast.completed ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Fasting Benefits</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Regular fasting improves insulin sensitivity, promotes autophagy 
                    (cellular cleanup), and can enhance fat burning by up to 30%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
