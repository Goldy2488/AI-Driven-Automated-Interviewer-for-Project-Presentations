import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { ArrowRight, Play, Sparkles, Bot, Mic, BarChart3 } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const projectTypes = [
  { value: "web", label: "Web Application" },
  { value: "mobile", label: "Mobile App" },
  { value: "ml", label: "Machine Learning" },
  { value: "system", label: "System Design" },
  { value: "other", label: "Other" },
];

// const features = [
//   {
//     icon: <Bot className="w-6 h-6" />,
//     title: "AI-Powered Questions",
//     description: "Adaptive questions based on your project content and responses",
//   },
//   {
//     icon: <Mic className="w-6 h-6" />,
//     title: "Voice Interaction",
//     description: "Natural conversation with real-time speech recognition",
//   },
//   {
//     icon: <BarChart3 className="w-6 h-6" />,
//     title: "Instant Feedback",
//     description: "Get detailed analysis and improvement suggestions",
//   },
// ];

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    projectTitle: "",
    projectType: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/interview", { state: formData });
  };

  const handleDemoMode = () => {
    navigate("/interview", {
      state: {
        studentName: "Demo Student",
        projectTitle: "E-Commerce Platform",
        projectType: "web",
        isDemo: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <main className="pt-16">
        <div className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Interview Platform
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Present Your Project.{" "}
                  <span className="gradient-text">Get Interviewed by AI.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Experience a professional interview simulation powered by advanced AI. 
                  Receive instant, actionable feedback to improve your presentation skills.
                </p>
              </div>

              {/* Setup Form */}
              <Card variant="elevated" className="max-w-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Start Your Session</CardTitle>
                  <CardDescription>
                    Enter your details to begin the interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={formData.studentName}
                        onChange={(e) =>
                          setFormData({ ...formData, studentName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., E-Commerce Platform"
                        value={formData.projectTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, projectTitle: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Project Type</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, projectType: value })
                        }
                        required
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {projectTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" variant="hero" size="lg" className="flex-1">
                        Start Presentation
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleDemoMode}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Demo
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right - Illustration */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <img
                  src={heroIllustration}
                  alt="AI Interview Illustration"
                  className="relative rounded-2xl shadow-float w-full"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          {/* <div className="mt-24 grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                variant="interactive"
                className={`p-6 animate-slide-up stagger-${index + 1}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div> */}
        </div>
      </main>
    </div>
  );
}
