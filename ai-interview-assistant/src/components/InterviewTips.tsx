import { Card } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewTipsProps {
  currentQuestionType?: "intro" | "technical" | "demo" | "closing";
  className?: string;
}

const tipsByType = {
  intro: [
    "Start with a brief overview of your project's purpose",
    "Mention the problem you're solving",
    "Keep it concise — aim for 30-60 seconds",
  ],
  technical: [
    "Explain your architecture decisions",
    "Mention specific technologies and why you chose them",
    "Be ready to dive deeper into implementation details",
  ],
  demo: [
    "Walk through the user flow step by step",
    "Highlight key features and functionality",
    "Show edge cases you've handled",
  ],
  closing: [
    "Summarize what you've learned",
    "Discuss future improvements you'd make",
    "Ask any clarifying questions",
  ],
};

export function InterviewTips({ currentQuestionType = "intro", className }: InterviewTipsProps) {
  const tips = tipsByType[currentQuestionType];

  return (
    <Card variant="glass" className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-warning" />
        </div>
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
          Quick Tips
        </h4>
      </div>
      
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li 
            key={index} 
            className="flex items-start gap-2 text-xs text-muted-foreground animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 text-accent" />
          <span>Speak naturally — the AI understands context!</span>
        </div>
      </div>
    </Card>
  );
}
