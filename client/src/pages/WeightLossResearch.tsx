import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, BookOpen, TrendingUp, Pill, Clock, Utensils, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function WeightLossResearch() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch research content from Grok API
  const { data: researchData, isLoading } = trpc.research.getLatestResearch.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading latest research...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Weight Loss Research</h1>
              <p className="text-gray-600 mt-1">Latest scientific findings and evidence-based strategies</p>
            </div>
          </div>
        </div>

        {/* Research Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="glp1" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">GLP-1 Drugs</span>
            </TabsTrigger>
            <TabsTrigger value="fasting" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Fasting</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="exercise" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Exercise</span>
            </TabsTrigger>
            <TabsTrigger value="metabolic" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Metabolic</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-emerald-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-900">2024-2025 Weight Loss Research Overview</CardTitle>
                <CardDescription>Key findings from the latest scientific studies</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-emerald max-w-none">
                <Streamdown>
                  {researchData?.overview || "Loading research overview..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GLP-1 Tab */}
          <TabsContent value="glp1" className="space-y-6">
            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-900">GLP-1 Medications Research</CardTitle>
                <CardDescription>Latest findings on semaglutide, tirzepatide, and emerging therapies</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-purple max-w-none">
                <Streamdown>
                  {researchData?.glp1 || "Loading GLP-1 research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fasting Tab */}
          <TabsContent value="fasting" className="space-y-6">
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">Intermittent Fasting Research</CardTitle>
                <CardDescription>Scientific evidence on time-restricted eating and metabolic benefits</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-blue max-w-none">
                <Streamdown>
                  {researchData?.fasting || "Loading fasting research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card className="border-orange-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-900">Nutrition Science</CardTitle>
                <CardDescription>Evidence-based dietary strategies for weight loss and metabolic health</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-orange max-w-none">
                <Streamdown>
                  {researchData?.nutrition || "Loading nutrition research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise" className="space-y-6">
            <Card className="border-red-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-red-900">Exercise & Physical Activity</CardTitle>
                <CardDescription>Latest research on exercise for weight loss and metabolic health</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-red max-w-none">
                <Streamdown>
                  {researchData?.exercise || "Loading exercise research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metabolic Tab */}
          <TabsContent value="metabolic" className="space-y-6">
            <Card className="border-teal-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-teal-900">Metabolic Health Research</CardTitle>
                <CardDescription>Cellular mechanisms, mitochondrial function, and metabolic optimization</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-teal max-w-none">
                <Streamdown>
                  {researchData?.metabolic || "Loading metabolic research..."}
                </Streamdown>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="mt-8 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-900">
              <strong>Medical Disclaimer:</strong> This research summary is for informational purposes only and does not constitute medical advice. 
              Always consult with qualified healthcare professionals before making changes to your diet, exercise routine, or medication regimen. 
              Individual results may vary, and what works for one person may not work for another.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
