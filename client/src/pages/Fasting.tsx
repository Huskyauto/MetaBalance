import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FastingTimer } from "@/components/FastingTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FastingSession {
  id: string;
  protocol: string;
  startTime: string;
  endTime?: string;
  targetDurationHours: number;
  actualDurationMinutes?: number;
  completed: boolean;
}

const protocols = [
  { value: "16:8", label: "16:8 (16h fast, 8h eating)", hours: 16 },
  { value: "18:6", label: "18:6 (18h fast, 6h eating)", hours: 18 },
  { value: "20:4", label: "20:4 (20h fast, 4h eating)", hours: 20 },
  { value: "OMAD", label: "OMAD (23h fast, 1h eating)", hours: 23 },
];

export function Fasting() {
  const [selectedProtocol, setSelectedProtocol] = useState("16:8");

  const { data: activeSession, isLoading: loadingActive } = useQuery<FastingSession | null>({
    queryKey: ["/api/fasting/active"],
  });

  const { data: history, isLoading: loadingHistory } = useQuery<FastingSession[]>({
    queryKey: ["/api/fasting/history"],
  });

  const startFast = useMutation({
    mutationFn: async () => {
      const protocol = protocols.find(p => p.value === selectedProtocol);
      return apiRequest("POST", "/api/fasting/start", { 
        protocol: selectedProtocol,
        targetDurationHours: protocol?.hours || 16,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fasting/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fasting/history"] });
    },
  });

  const endFast = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/fasting/${id}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fasting/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fasting/history"] });
    },
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loadingActive) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Intermittent Fasting</h1>
        <p className="text-muted-foreground">Track your fasting windows and build consistency</p>
      </div>

      {activeSession ? (
        <FastingTimer
          startTime={new Date(activeSession.startTime)}
          targetHours={activeSession.targetDurationHours}
          protocol={activeSession.protocol}
          onEnd={() => endFast.mutate(activeSession.id)}
          isEnding={endFast.isPending}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Fast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Protocol</label>
              <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                <SelectTrigger data-testid="select-protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full" 
              onClick={() => startFast.mutate()}
              disabled={startFast.isPending}
              data-testid="button-start-fast"
            >
              <Clock className="h-4 w-4 mr-2" />
              {startFast.isPending ? "Starting..." : "Start Fasting"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Fasts</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.filter(s => s.completed).slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`history-${session.id}`}
                >
                  <div className="flex items-center gap-3">
                    {session.actualDurationMinutes && session.actualDurationMinutes >= session.targetDurationHours * 60 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{session.protocol}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {session.actualDurationMinutes ? formatDuration(session.actualDurationMinutes) : "In progress"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Target: {session.targetDurationHours}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No fasting history yet. Start your first fast above!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
