import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

interface FastingTimerProps {
  protocol: string;
  targetHours: number;
}

export function FastingTimer({ protocol, targetHours }: FastingTimerProps) {
  const [isActive, setIsActive] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(14 * 60 * 60 + 32 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const targetSeconds = targetHours * 60 * 60;
  const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPhase = () => {
    const hours = elapsedSeconds / 3600;
    if (hours < 4) return { name: "Fed State", color: "bg-blue-500" };
    if (hours < 12) return { name: "Post-absorptive", color: "bg-green-500" };
    if (hours < 16) return { name: "Fat Burning", color: "bg-orange-500" };
    return { name: "Ketosis", color: "bg-purple-500" };
  };

  const phase = getPhase();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Intermittent Fasting
        </CardTitle>
        <Badge variant="secondary">{protocol}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${progress * 5.53} 553`}
                strokeLinecap="round"
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{formatTime(elapsedSeconds)}</span>
              <span className="text-sm text-muted-foreground">Elapsed</span>
            </div>
          </div>

          <Badge className={`mt-4 ${phase.color}`}>{phase.name}</Badge>

          <div className="flex items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setElapsedSeconds(0)}
              data-testid="button-reset-fast"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => setIsActive(!isActive)}
              data-testid="button-toggle-fast"
            >
              {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isActive ? "Pause" : "Resume"}
            </Button>
          </div>

          <div className="w-full mt-6 pt-4 border-t">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium">{formatTime(remainingSeconds)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
