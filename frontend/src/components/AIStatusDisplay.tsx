import { cn } from "@/lib/utils";
import { Mic, Brain, Volume2, Pause, Sparkles } from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";

type AIState = "idle" | "listening" | "thinking" | "speaking";

interface AIStatusDisplayProps {
  state: AIState;
  interviewerName?: string;
  className?: string;
}

const stateConfig = {
  idle: {
    icon: Pause,
    title: "Ready",
    message: "Take your time to prepare your answer",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  listening: {
    icon: Mic,
    title: "Listening",
    message: "I'm all ears — speak clearly and confidently!",
    color: "text-ai-listening",
    bgColor: "bg-ai-listening/10",
  },
  thinking: {
    icon: Brain,
    title: "Analyzing",
    message: "Processing your response and preparing follow-up...",
    color: "text-ai-thinking",
    bgColor: "bg-ai-thinking/10",
  },
  speaking: {
    icon: Volume2,
    title: "Speaking",
    message: "Please listen carefully to the question",
    color: "text-ai-speaking",
    bgColor: "bg-ai-speaking/10",
  },
  analyzing: {
    icon: Brain,
    title: "Analyzing",
    message: "Processing your presentation and generating questions...",
    color: "text-ai-thinking",
    bgColor: "bg-ai-thinking/10",
  },
};

export function AIStatusDisplay({ state, interviewerName = "AI Interviewer", className }: AIStatusDisplayProps) {
  const config = stateConfig[state] || stateConfig.idle;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl p-4 transition-all duration-500", config.bgColor, className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          state === "listening" && "animate-pulse",
          state === "thinking" && "animate-spin-slow",
          config.color,
          "bg-background/80"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold text-sm", config.color)}>
              {config.title}
            </span>
            {state === "listening" && (
              <WaveformVisualizer isActive bars={4} className="ml-1" />
            )}
            {state === "thinking" && (
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn("w-1.5 h-1.5 rounded-full bg-ai-thinking animate-bounce")}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {config.message}
          </p>
        </div>

        {state === "speaking" && (
          <div className="flex items-center gap-1 text-ai-speaking">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
