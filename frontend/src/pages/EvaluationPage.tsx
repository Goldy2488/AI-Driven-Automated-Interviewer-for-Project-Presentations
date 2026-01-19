import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Brain,
  MessageSquare,
  Lightbulb,
  Code,
} from "lucide-react";

interface LocationState {
  studentName?: string;
  projectTitle?: string;
  projectType?: string;
  elapsedTime?: number;
}

const evaluationData = {
  overallScore: 78,
  sections: [
    { label: "Technical Depth", value: 82, variant: "accent" as const },
    { label: "Clarity", value: 88, variant: "success" as const },
    { label: "Originality", value: 72, variant: "warning" as const },
    { label: "Implementation", value: 75, variant: "default" as const },
  ],
  strengths: [
    "Clear explanation of authentication flow",
    "Good understanding of React component architecture",
    "Well-articulated business problem and solution",
    "Demonstrated knowledge of REST API design",
  ],
  improvements: [
    "Consider adding more details about error handling strategies",
    "Discuss scalability considerations for database design",
    "Include security measures for sensitive data storage",
    "Elaborate on testing methodology and coverage",
  ],
  summary: `The presentation demonstrated a solid understanding of the E-Commerce Platform's architecture and implementation. The candidate showed strong communication skills and technical knowledge, particularly in areas of frontend development and API integration. There's room for improvement in discussing system scalability and security considerations. Overall, this was a well-prepared presentation with clear explanations of key features.`,
};

export default function EvaluationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const handleNewInterview = () => {
    navigate("/");
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "15:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="container mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Interview Complete
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Evaluation Report
            </h1>
            <p className="text-muted-foreground">
              {state?.projectTitle || "E-Commerce Platform"} • Duration:{" "}
              {formatTime(state?.elapsedTime)}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Score & Breakdown */}
            <div className="lg:col-span-1 space-y-6">
              {/* Overall Score */}
              <Card variant="elevated" className="p-8 text-center">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                  Overall Score
                </h3>
                <CircularProgress
                  value={evaluationData.overallScore}
                  size={180}
                  strokeWidth={12}
                  variant={evaluationData.overallScore >= 80 ? "success" : "accent"}
                  label="out of 100"
                />
                <Badge
                  variant={evaluationData.overallScore >= 80 ? "success" : "secondary"}
                  className="mt-6"
                >
                  {evaluationData.overallScore >= 80
                    ? "Excellent Performance"
                    : evaluationData.overallScore >= 60
                    ? "Good Performance"
                    : "Needs Improvement"}
                </Badge>
              </Card>

              {/* Section Breakdown */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Section Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evaluationData.sections.map((section) => (
                    <ProgressBar
                      key={section.label}
                      label={section.label}
                      value={section.value}
                      variant={section.variant}
                      size="md"
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Feedback */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Summary */}
              <Card variant="glass" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      AI-Generated Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {evaluationData.summary}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Strengths & Improvements Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {evaluationData.strengths.map((strength, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-foreground"
                        >
                          <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          </span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Improvements */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-warning">
                      <Lightbulb className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {evaluationData.improvements.map((improvement, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-foreground"
                        >
                          <span className="w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="w-3 h-3 text-warning" />
                          </span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <Card variant="glass" className="p-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Report
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleNewInterview}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start New Interview
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
