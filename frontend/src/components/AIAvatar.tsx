import { cn } from "@/lib/utils";
import { Mic, Volume2, Brain } from "lucide-react";

type AIState = "idle" | "listening" | "thinking" | "speaking";

interface AIAvatarProps {
  state: AIState;
  imageSrc: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AIAvatar({
  state,
  imageSrc,
  size = "md",
  className,
}: AIAvatarProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const stateConfig = {
    idle: {
      ringClass: "ring-border",
      icon: null,
      pulseClass: "",
    },
    listening: {
      ringClass: "ring-ai-listening",
      icon: <Mic size={iconSize[size]} className="text-ai-listening" />,
      pulseClass: "animate-mic-pulse",
    },
    thinking: {
      ringClass: "ring-ai-thinking",
      icon: <Brain size={iconSize[size]} className="text-ai-thinking" />,
      pulseClass: "animate-pulse",
    },
    speaking: {
      ringClass: "ring-ai-speaking",
      icon: <Volume2 size={iconSize[size]} className="text-ai-speaking" />,
      pulseClass: "",
    },
    analyzing: {
      ringClass: "ring-ai-thinking",
      icon: <Brain size={iconSize[size]} className="text-ai-thinking" />,
      pulseClass: "animate-pulse",
    },
  };

  const config = stateConfig[state] || stateConfig.idle;

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Outer glow ring for active states */}
      {state !== "idle" && (
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            config.pulseClass
          )}
          style={{
            background: state === "listening" 
              ? "radial-gradient(circle, hsl(var(--ai-listening) / 0.3), transparent 70%)"
              : state === "thinking"
              ? "radial-gradient(circle, hsl(var(--ai-thinking) / 0.3), transparent 70%)"
              : "radial-gradient(circle, hsl(var(--ai-speaking) / 0.3), transparent 70%)",
            transform: "scale(1.3)",
          }}
        />
      )}
      
      {/* Avatar container */}
      <div
        className={cn(
          "relative rounded-full ring-4 transition-all duration-300 overflow-hidden bg-card",
          sizeClasses[size],
          config.ringClass
        )}
      >
        <img
          src={imageSrc}
          alt="AI Interviewer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* State indicator badge */}
      {config.icon && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card shadow-elevated",
            config.pulseClass
          )}
        >
          {config.icon}
        </div>
      )}
    </div>
  );
}
