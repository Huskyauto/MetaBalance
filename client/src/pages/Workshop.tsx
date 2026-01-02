import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Circle,
  Apple,
  Eye,
  MessageSquare,
  Target,
  Sparkles,
  ChevronRight,
  FileText,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkshopProgress } from "@shared/schema";

type WorkshopProgressInput = {
  dayNumber: number;
  exerciseResponse?: string | null;
  reflectionResponse?: string | null;
  completed?: boolean;
};

const WORKSHOP_DAYS = [
  {
    day: 1,
    title: "Nourish",
    subtitle: "Feed Your Body Right",
    icon: Apple,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Learn to fuel your body with healthy, balanced meals that boost your metabolism.",
    content: {
      intro: "Welcome to Day 1! Today we focus on understanding how to properly nourish your body. Many people who struggle with emotional eating have a complicated relationship with food itself. By learning the basics of balanced nutrition, you create a foundation for lasting change.",
      keyPoints: [
        "Understanding macronutrients: proteins, carbohydrates, and fats",
        "The importance of eating regularly to stabilize blood sugar",
        "How undereating can trigger overeating later",
        "Building meals that satisfy both body and mind"
      ],
      exercise: "Write down what you typically eat in a day. Notice any patterns - do you skip meals? Do you eat enough protein? Are there long gaps between eating?",
      reflection: "What would it feel like to eat in a way that truly nourishes your body without restriction or guilt?"
    }
  },
  {
    day: 2,
    title: "Awareness",
    subtitle: "See Your Patterns",
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Develop awareness of habits and behaviors that keep you in the yo-yo dieting cycle.",
    content: {
      intro: "Day 2 is about developing awareness. You can't change what you don't see. Today we'll explore the unconscious habits and behaviors that have been running on autopilot, keeping you stuck in the same cycles.",
      keyPoints: [
        "Recognizing automatic eating behaviors",
        "Understanding the difference between physical and emotional hunger",
        "Identifying your personal eating patterns",
        "The power of mindful eating"
      ],
      exercise: "For the next 24 hours, pause before every time you eat and ask: 'Am I physically hungry, or is something else going on?' Write down your observations.",
      reflection: "What patterns have you noticed in your eating? When do you tend to eat when you're not hungry?"
    }
  },
  {
    day: 3,
    title: "Messaging",
    subtitle: "Transform Your Self-Talk",
    icon: MessageSquare,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Transform negative self-talk into powerful, positive affirmations.",
    content: {
      intro: "The way you talk to yourself matters enormously. Day 3 focuses on the messages you send yourself about food, your body, and your worth. These internal messages often sabotage our best efforts.",
      keyPoints: [
        "Identifying your inner critic's voice",
        "Understanding how negative self-talk triggers emotional eating",
        "Creating compassionate responses to difficult moments",
        "Building affirmations that actually work"
      ],
      exercise: "Write down 3 negative things you commonly say to yourself about your body or eating. Then, rewrite each one as something a supportive friend would say instead.",
      reflection: "How would your relationship with food change if you spoke to yourself with kindness instead of criticism?"
    }
  },
  {
    day: 4,
    title: "Triggers",
    subtitle: "Know Your Patterns",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Identify your emotional eating triggers and create strategies to overcome them.",
    content: {
      intro: "Day 4 dives deep into your personal triggers. Emotional eating doesn't happen randomly - there are specific situations, emotions, and circumstances that trigger the urge to eat for comfort. Understanding your triggers is the key to breaking free.",
      keyPoints: [
        "Common emotional eating triggers (stress, boredom, loneliness, anger)",
        "Situational triggers (time of day, location, social settings)",
        "The trigger-urge-behavior chain",
        "Creating alternative responses to triggers"
      ],
      exercise: "Think back to your last 3 episodes of emotional eating. What was happening before each one? What emotion were you feeling? Look for patterns.",
      reflection: "What are your top 3 triggers, and what could you do instead of eating when they occur?"
    }
  },
  {
    day: 5,
    title: "New Story",
    subtitle: "Rewrite Your Future",
    icon: Sparkles,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    description: "Rewrite your mental script and step into a healthier relationship with food.",
    content: {
      intro: "Congratulations on reaching Day 5! Today is about taking everything you've learned and creating a new story for yourself. You are not defined by your past struggles with food. You have the power to write a new chapter.",
      keyPoints: [
        "Releasing the old story of struggle and failure",
        "Creating a vision of your future self",
        "Building sustainable habits that align with your new story",
        "Celebrating progress, not perfection"
      ],
      exercise: "Write a letter to yourself from one year in the future. Describe how you now relate to food, your body, and yourself. What changed? How do you feel?",
      reflection: "What is one small step you can take today that aligns with the person you want to become?"
    }
  }
];

export default function Workshop() {
  const { toast } = useToast();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [worksheetResponses, setWorksheetResponses] = useState<Record<number, { exercise: string; reflection: string }>>({});

  const { data: progress, isLoading } = useQuery<WorkshopProgress[]>({
    queryKey: ['/api/workshop-progress']
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (data: WorkshopProgressInput) => {
      return apiRequest('POST', '/api/workshop-progress', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-progress'] });
      toast({
        title: "Progress saved",
        description: "Your workshop progress has been saved."
      });
    }
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (dayNumber: number) => {
      return apiRequest('POST', `/api/workshop-progress/${dayNumber}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-progress'] });
      toast({
        title: "Day completed!",
        description: "Great work! You've completed this day's lesson."
      });
    }
  });

  const getDayProgress = (dayNumber: number) => {
    return progress?.find(p => p.dayNumber === dayNumber);
  };

  const completedDays = progress?.filter(p => p.completed).length || 0;
  const overallProgress = (completedDays / 5) * 100;

  const handleSaveWorksheet = (dayNumber: number) => {
    const responses = worksheetResponses[dayNumber];
    
    saveProgressMutation.mutate({
      dayNumber,
      exerciseResponse: responses?.exercise || null,
      reflectionResponse: responses?.reflection || null,
      completed: false
    });
  };

  const handleMarkComplete = (dayNumber: number) => {
    markCompleteMutation.mutate(dayNumber);
  };

  const currentDayData = WORKSHOP_DAYS.find(d => d.day === activeDay);
  const currentProgress = getDayProgress(activeDay);

  const canAccessDay = (dayNumber: number) => {
    if (dayNumber === 1) return true;
    const prevDay = getDayProgress(dayNumber - 1);
    return prevDay?.completed || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-workshop-title">5-Day Workshop</h1>
          <p className="text-muted-foreground">Crack the Code to Stop Emotional Eating</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium">Your Progress</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {completedDays} of 5 days completed
                </p>
              </div>
              <div className="flex gap-2">
                {WORKSHOP_DAYS.map((day) => {
                  const dayProgress = getDayProgress(day.day);
                  const accessible = canAccessDay(day.day);
                  return (
                    <Button
                      key={day.day}
                      size="icon"
                      variant={activeDay === day.day ? "default" : "outline"}
                      onClick={() => accessible && setActiveDay(day.day)}
                      disabled={!accessible}
                      data-testid={`button-day-${day.day}`}
                    >
                      {dayProgress?.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : accessible ? (
                        <span>{day.day}</span>
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Day Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {WORKSHOP_DAYS.map((day) => {
                const dayProgress = getDayProgress(day.day);
                const accessible = canAccessDay(day.day);
                const DayIcon = day.icon;
                
                return (
                  <button
                    key={day.day}
                    onClick={() => accessible && setActiveDay(day.day)}
                    disabled={!accessible}
                    className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left ${
                      activeDay === day.day 
                        ? "bg-primary/10 border border-primary/20" 
                        : accessible 
                          ? "hover-elevate" 
                          : "opacity-50 cursor-not-allowed"
                    }`}
                    data-testid={`button-select-day-${day.day}`}
                  >
                    <div className={`p-2 rounded-md ${day.bgColor}`}>
                      <DayIcon className={`h-4 w-4 ${day.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Day {day.day}: {day.title}</span>
                        {dayProgress?.completed && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                        {!accessible && (
                          <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{day.subtitle}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                About This Workshop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This 5-day journey will help you understand what's been missing on your weight loss journey. 
                Each day builds on the last, guiding you through understanding and transforming your relationship with food.
              </p>
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium">Lisa Goldberg</p>
                <p className="text-xs text-muted-foreground">Nutritionist & Weight Loss Coach</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {currentDayData && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-md ${currentDayData.bgColor}`}>
                    <currentDayData.icon className={`h-6 w-6 ${currentDayData.color}`} />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Day {currentDayData.day}: {currentDayData.title}
                      {currentProgress?.completed && (
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{currentDayData.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="lesson" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lesson" data-testid="tab-lesson">
                      <Play className="h-4 w-4 mr-2" />
                      Lesson
                    </TabsTrigger>
                    <TabsTrigger value="worksheet" data-testid="tab-worksheet">
                      <FileText className="h-4 w-4 mr-2" />
                      Worksheet
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="lesson" className="space-y-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-3">Introduction</h3>
                      <p className="text-muted-foreground">{currentDayData.content.intro}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Key Points</h3>
                      <ul className="space-y-2">
                        {currentDayData.content.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0 fill-current" />
                            <span className="text-muted-foreground">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Today's Exercise
                      </h3>
                      <p className="text-muted-foreground text-sm">{currentDayData.content.exercise}</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Reflection Question
                      </h3>
                      <p className="text-muted-foreground text-sm italic">"{currentDayData.content.reflection}"</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="worksheet" className="space-y-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-3">Exercise Response</h3>
                      <p className="text-sm text-muted-foreground mb-3">{currentDayData.content.exercise}</p>
                      <Textarea
                        placeholder="Write your response here..."
                        className="min-h-[120px]"
                        value={worksheetResponses[activeDay]?.exercise || currentProgress?.exerciseResponse || ""}
                        onChange={(e) => setWorksheetResponses(prev => ({
                          ...prev,
                          [activeDay]: {
                            ...prev[activeDay],
                            exercise: e.target.value,
                            reflection: prev[activeDay]?.reflection || currentProgress?.reflectionResponse || ""
                          }
                        }))}
                        data-testid="textarea-exercise"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Reflection</h3>
                      <p className="text-sm text-muted-foreground mb-3 italic">"{currentDayData.content.reflection}"</p>
                      <Textarea
                        placeholder="Write your reflection here..."
                        className="min-h-[120px]"
                        value={worksheetResponses[activeDay]?.reflection || currentProgress?.reflectionResponse || ""}
                        onChange={(e) => setWorksheetResponses(prev => ({
                          ...prev,
                          [activeDay]: {
                            ...prev[activeDay],
                            exercise: prev[activeDay]?.exercise || currentProgress?.exerciseResponse || "",
                            reflection: e.target.value
                          }
                        }))}
                        data-testid="textarea-reflection"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => handleSaveWorksheet(activeDay)}
                        disabled={saveProgressMutation.isPending}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-save-worksheet"
                      >
                        Save Progress
                      </Button>
                      {!currentProgress?.completed && (
                        <Button
                          onClick={() => handleMarkComplete(activeDay)}
                          disabled={markCompleteMutation.isPending}
                          className="flex-1"
                          data-testid="button-complete-day"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Day Complete
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
