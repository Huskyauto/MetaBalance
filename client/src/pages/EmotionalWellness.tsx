import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, Brain, BookOpen, Shield, Lightbulb, Plus, Star, 
  Frown, Meh, Smile, AlertCircle, Clock, TrendingUp, Check, X, Loader2
} from "lucide-react";
import type { MoodCheckIn, EmotionalJournal, CopingStrategy } from "@shared/schema";

const MOODS = [
  { value: "stressed", label: "Stressed", icon: AlertCircle, color: "text-orange-500" },
  { value: "anxious", label: "Anxious", icon: AlertCircle, color: "text-yellow-500" },
  { value: "sad", label: "Sad", icon: Frown, color: "text-blue-500" },
  { value: "bored", label: "Bored", icon: Meh, color: "text-gray-500" },
  { value: "lonely", label: "Lonely", icon: Heart, color: "text-purple-500" },
  { value: "tired", label: "Tired", icon: Clock, color: "text-slate-500" },
  { value: "angry", label: "Angry", icon: AlertCircle, color: "text-red-500" },
  { value: "overwhelmed", label: "Overwhelmed", icon: Brain, color: "text-pink-500" },
  { value: "happy", label: "Happy", icon: Smile, color: "text-green-500" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-muted-foreground" },
];

const TRIGGERS = [
  "Work stress", "Family issues", "Relationship problems", "Financial worries",
  "Lack of sleep", "Boredom", "Social situations", "Loneliness",
  "Negative self-talk", "Unmet expectations", "Physical discomfort", "Time pressure"
];

const DEFAULT_COPING_STRATEGIES = [
  { name: "Deep breathing", category: "physical", description: "Take 5 slow, deep breaths" },
  { name: "Go for a walk", category: "physical", description: "Get moving for 10-15 minutes" },
  { name: "Drink water", category: "physical", description: "Have a full glass of water first" },
  { name: "Call a friend", category: "social", description: "Connect with someone supportive" },
  { name: "Write in journal", category: "mental", description: "Express your feelings on paper" },
  { name: "Listen to music", category: "creative", description: "Play calming or uplifting songs" },
  { name: "Stretch or yoga", category: "physical", description: "Release tension from your body" },
  { name: "Wait 10 minutes", category: "mental", description: "Pause before acting on urges" },
];

const JOURNAL_PROMPTS = [
  "What am I really feeling right now, beyond hunger?",
  "What triggered this urge to eat?",
  "What would truly satisfy me in this moment?",
  "How will I feel after eating this?",
  "What am I trying to avoid or escape?",
  "What would I tell a friend in this situation?",
];

function MoodCheckInSection() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [intensity, setIntensity] = useState([5]);
  const [hungerLevel, setHungerLevel] = useState([5]);
  const [context, setContext] = useState<string>("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { data: recentCheckIns, isLoading } = useQuery<MoodCheckIn[]>({
    queryKey: ["/api/mood-checkins", { limit: 10 }],
  });

  const createCheckIn = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      return apiRequest("POST", "/api/mood-checkins", {
        mood: selectedMood,
        intensity: intensity[0],
        hungerLevel: hungerLevel[0],
        context,
        triggers: selectedTriggers,
        notes,
        date: today,
        time,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-checkins"] });
      toast({ title: "Check-in saved", description: "Your mood has been logged." });
      setSelectedMood("");
      setIntensity([5]);
      setHungerLevel([5]);
      setContext("");
      setSelectedTriggers([]);
      setNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save check-in.", variant: "destructive" });
    },
  });

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            How are you feeling right now?
          </CardTitle>
          <CardDescription>
            Check in with yourself before reaching for food
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  className="flex flex-col h-auto py-3 gap-1 min-w-0"
                  onClick={() => setSelectedMood(mood.value)}
                  data-testid={`button-mood-${mood.value}`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${selectedMood !== mood.value ? mood.color : ""}`} />
                  <span className="text-xs truncate w-full text-center">{mood.label}</span>
                </Button>
              );
            })}
          </div>

          {selectedMood && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label>Emotional Intensity (1-10)</Label>
                  <span className="text-sm font-medium">{intensity[0]}</span>
                </div>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={10}
                  min={1}
                  step={1}
                  data-testid="slider-intensity"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label>Actual Hunger Level (1-10)</Label>
                  <span className="text-sm font-medium">{hungerLevel[0]}</span>
                </div>
                <Slider
                  value={hungerLevel}
                  onValueChange={setHungerLevel}
                  max={10}
                  min={1}
                  step={1}
                  data-testid="slider-hunger"
                />
                <p className="text-xs text-muted-foreground">
                  {hungerLevel[0] <= 3 ? "Not hungry - likely emotional eating" : 
                   hungerLevel[0] <= 6 ? "Slightly hungry - consider waiting" : 
                   "Genuinely hungry - nourish your body"}
                </p>
              </div>

              <div className="space-y-3">
                <Label>When is this happening?</Label>
                <Select value={context} onValueChange={setContext}>
                  <SelectTrigger data-testid="select-context">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_eating">Before eating</SelectItem>
                    <SelectItem value="during_craving">During a craving</SelectItem>
                    <SelectItem value="after_eating">After eating</SelectItem>
                    <SelectItem value="general">General check-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>What might be triggering this?</Label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGERS.map((trigger) => (
                    <Badge
                      key={trigger}
                      variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTrigger(trigger)}
                      data-testid={`badge-trigger-${trigger.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes">Additional notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="What else is on your mind?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="textarea-notes"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={() => createCheckIn.mutate()}
                disabled={createCheckIn.isPending}
                data-testid="button-save-checkin"
              >
                {createCheckIn.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Check-in
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {recentCheckIns && recentCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => {
                  const moodInfo = MOODS.find(m => m.value === checkIn.mood);
                  const MoodIcon = moodInfo?.icon || Meh;
                  return (
                    <div key={checkIn.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MoodIcon className={`h-5 w-5 mt-0.5 ${moodInfo?.color || ""}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium capitalize">{checkIn.mood}</span>
                          <Badge variant="secondary" className="text-xs">
                            Intensity: {checkIn.intensity}/10
                          </Badge>
                          {checkIn.hungerLevel && (
                            <Badge variant="outline" className="text-xs">
                              Hunger: {checkIn.hungerLevel}/10
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {checkIn.date} {checkIn.time && `at ${checkIn.time}`}
                        </p>
                        {checkIn.triggers && checkIn.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {checkIn.triggers.map((trigger, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function JournalSection() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [journalType, setJournalType] = useState<string>("reflection");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const { data: journals, isLoading } = useQuery<EmotionalJournal[]>({
    queryKey: ["/api/emotional-journals"],
  });

  const createJournal = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return apiRequest("POST", "/api/emotional-journals", {
        type: journalType,
        title: title || undefined,
        content,
        date: today,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotional-journals"] });
      toast({ title: "Journal saved", description: "Your reflection has been recorded." });
      setIsOpen(false);
      setTitle("");
      setContent("");
      setJournalType("reflection");
      setSelectedPrompt(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save journal.", variant: "destructive" });
    },
  });

  const deleteJournal = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/emotional-journals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotional-journals"] });
      toast({ title: "Journal deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Emotional Journal
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-new-journal">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Write a Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Entry Type</Label>
                    <Select value={journalType} onValueChange={setJournalType}>
                      <SelectTrigger data-testid="select-journal-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reflection">Reflection</SelectItem>
                        <SelectItem value="breakthrough">Breakthrough</SelectItem>
                        <SelectItem value="challenge">Challenge</SelectItem>
                        <SelectItem value="gratitude">Gratitude</SelectItem>
                        <SelectItem value="pattern_insight">Pattern Insight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Use a prompt (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {JOURNAL_PROMPTS.map((prompt, i) => (
                        <Badge
                          key={i}
                          variant={selectedPrompt === prompt ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setContent(prompt + "\n\n");
                          }}
                        >
                          {prompt.slice(0, 30)}...
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="journal-title">Title (optional)</Label>
                    <Input
                      id="journal-title"
                      placeholder="Give this entry a title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      data-testid="input-journal-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="journal-content">Your thoughts</Label>
                    <Textarea
                      id="journal-content"
                      placeholder="Write freely about what you're experiencing..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[150px]"
                      data-testid="textarea-journal-content"
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => createJournal.mutate()}
                    disabled={!content.trim() || createJournal.isPending}
                    data-testid="button-save-journal"
                  >
                    {createJournal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Explore your relationship with food and emotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading journals...</div>
          ) : journals && journals.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {journals.map((journal) => (
                  <Card key={journal.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">
                              {journal.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{journal.date}</span>
                          </div>
                          {journal.title && (
                            <h4 className="font-medium mb-2">{journal.title}</h4>
                          )}
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {journal.content}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteJournal.mutate(journal.id)}
                          data-testid={`button-delete-journal-${journal.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No journal entries yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start writing to understand your emotional eating patterns
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CopingToolboxSection() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("physical");
  const [description, setDescription] = useState("");

  const { data: strategies, isLoading } = useQuery<CopingStrategy[]>({
    queryKey: ["/api/coping-strategies"],
  });

  const createStrategy = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/coping-strategies", {
        name,
        category,
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-strategies"] });
      toast({ title: "Strategy added", description: "Your coping strategy has been saved." });
      setIsOpen(false);
      setName("");
      setCategory("physical");
      setDescription("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add strategy.", variant: "destructive" });
    },
  });

  const addDefaultStrategy = useMutation({
    mutationFn: async (strategy: typeof DEFAULT_COPING_STRATEGIES[0]) => {
      return apiRequest("POST", "/api/coping-strategies", strategy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-strategies"] });
      toast({ title: "Strategy added" });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      return apiRequest("PATCH", `/api/coping-strategies/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-strategies"] });
    },
  });

  const incrementUsed = useMutation({
    mutationFn: async (strategy: CopingStrategy) => {
      return apiRequest("PATCH", `/api/coping-strategies/${strategy.id}`, { 
        timesUsed: (strategy.timesUsed || 0) + 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-strategies"] });
      toast({ title: "Great job!", description: "Using healthy coping strategies is a win!" });
    },
  });

  const deleteStrategy = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/coping-strategies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-strategies"] });
      toast({ title: "Strategy removed" });
    },
  });

  const categoryIcons: Record<string, typeof Heart> = {
    physical: Heart,
    mental: Brain,
    social: Heart,
    creative: Lightbulb,
    "self-care": Shield,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Coping Toolbox
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-strategy">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Strategy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Coping Strategy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy-name">Strategy Name</Label>
                    <Input
                      id="strategy-name"
                      placeholder="e.g., Take a bubble bath"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-strategy-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger data-testid="select-strategy-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="mental">Mental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="self-care">Self-Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strategy-description">Description (optional)</Label>
                    <Textarea
                      id="strategy-description"
                      placeholder="How to do this..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      data-testid="textarea-strategy-description"
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => createStrategy.mutate()}
                    disabled={!name.trim() || createStrategy.isPending}
                    data-testid="button-save-strategy"
                  >
                    {createStrategy.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Strategy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Healthy alternatives when emotions trigger the urge to eat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading strategies...</div>
          ) : strategies && strategies.length > 0 ? (
            <div className="space-y-3">
              {strategies.map((strategy) => {
                const Icon = categoryIcons[strategy.category] || Heart;
                return (
                  <div 
                    key={strategy.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                  >
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{strategy.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {strategy.category}
                        </Badge>
                        {strategy.timesUsed && strategy.timesUsed > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Used {strategy.timesUsed}x
                          </Badge>
                        )}
                      </div>
                      {strategy.description && (
                        <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleFavorite.mutate({ id: strategy.id, isFavorite: !strategy.isFavorite })}
                        data-testid={`button-favorite-${strategy.id}`}
                      >
                        <Star className={`h-4 w-4 ${strategy.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => incrementUsed.mutate(strategy)}
                        data-testid={`button-use-${strategy.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteStrategy.mutate(strategy.id)}
                        className="opacity-0 group-hover:opacity-100"
                        data-testid={`button-delete-${strategy.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">Build Your Coping Toolbox</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add strategies that work for you, or start with these suggestions
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEFAULT_COPING_STRATEGIES.map((strategy) => (
                  <Button
                    key={strategy.name}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => addDefaultStrategy.mutate(strategy)}
                    disabled={addDefaultStrategy.isPending}
                    data-testid={`button-add-default-${strategy.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{strategy.name}</div>
                      <div className="text-xs text-muted-foreground">{strategy.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function EmotionalWellness() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emotional Wellness</h1>
        <p className="text-muted-foreground">
          Understand and manage emotional eating patterns
        </p>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkin" data-testid="tab-checkin">
            <Heart className="h-4 w-4 mr-2" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="journal" data-testid="tab-journal">
            <BookOpen className="h-4 w-4 mr-2" />
            Journal
          </TabsTrigger>
          <TabsTrigger value="toolbox" data-testid="tab-toolbox">
            <Shield className="h-4 w-4 mr-2" />
            Toolbox
          </TabsTrigger>
        </TabsList>
        <TabsContent value="checkin" className="mt-6">
          <MoodCheckInSection />
        </TabsContent>
        <TabsContent value="journal" className="mt-6">
          <JournalSection />
        </TabsContent>
        <TabsContent value="toolbox" className="mt-6">
          <CopingToolboxSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
