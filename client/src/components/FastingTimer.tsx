import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, StopCircle } from "lucide-react";

interface FastingTimerProps {
  protocol: string;
  targetHours: number;
  startTime: Date;
  onEnd: () => void;
  isEnding?: boolean;
}

export function FastingTimer({ protocol, targetHours, startTime, onEnd, isEnding }: FastingTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    };
    
    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const targetSeconds = targetHours * 60 * 60;
  const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);
  const isComplete = elapsedSeconds >= targetSeconds;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPhase = () => {
    const hours = elapsedSeconds / 3600;
    if (hours < 4) return { name: "Fed State", color: "bg-blue-500", description: "Body processing last meal" };
    if (hours < 12) return { name: "Post-absorptive", color: "bg-green-500", description: "Insulin normalizing" };
    if (hours < 16) return { name: "Fat Burning", color: "bg-orange-500", description: "Using fat for energy" };
    if (hours < 24) return { name: "Ketosis", color: "bg-purple-500", description: "Deep fat burning" };
    return { name: "Extended", color: "bg-red-500", description: "Extended fasting state" };
  };

  const phase = getPhase();
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Active Fast
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
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={isComplete ? "text-green-500" : "text-primary"}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums" data-testid="text-elapsed-time">
                {formatTime(elapsedSeconds)}
              </span>
              <span className="text-sm text-muted-foreground">elapsed</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${phase.color}`} />
              <span className="font-medium">{phase.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{phase.description}</p>
          </div>

          <div className="mt-6 w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium" data-testid="text-remaining-time">
                {isComplete ? "Complete!" : formatTime(remainingSeconds)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-medium">{targetHours} hours</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium">
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <Button 
            variant={isComplete ? "default" : "destructive"} 
            className="mt-6 w-full max-w-xs"
            onClick={onEnd}
            disabled={isEnding}
            data-testid="button-end-fast"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            {isEnding ? "Ending..." : isComplete ? "Complete Fast" : "End Fast Early"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
