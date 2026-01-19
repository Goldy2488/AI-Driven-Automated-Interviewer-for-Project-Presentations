import { cn } from "@/lib/utils";
import { Check, Circle, ArrowRight } from "lucide-react";

interface Stage {
  id: string;
  label: string;
  description: string;
}

interface InterviewProgressProps {
  currentStage: number;
  className?: string;
}

const stages: Stage[] = [
  { id: "intro", label: "Introduction", description: "Getting to know your project" },
  { id: "demo", label: "Demo", description: "Walking through key features" },
  { id: "technical", label: "Technical Deep Dive", description: "Architecture & implementation" },
  { id: "closing", label: "Closing", description: "Final questions & summary" },
];

export function InterviewProgress({ currentStage, className }: InterviewProgressProps) {
  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      {stages.map((stage, index) => {
        const isCompleted = index < currentStage;
        const isCurrent = index === currentStage;
        const isUpcoming = index > currentStage;

        return (
          <div key={stage.id} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted && "bg-success text-success-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                  isUpcoming && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Circle className="w-3 h-3 fill-current" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-xs font-medium transition-colors",
                  isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
                )}>
                  {stage.label}
                </p>
                <p className="text-[10px] text-muted-foreground hidden lg:block">
                  {stage.description}
                </p>
              </div>
            </div>
            
            {index < stages.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-muted relative overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-y-0 left-0 bg-success transition-all duration-700",
                    isCompleted ? "w-full" : "w-0"
                  )}
                />
                {isCurrent && (
                  <ArrowRight className="absolute -right-1 -top-1.5 w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
