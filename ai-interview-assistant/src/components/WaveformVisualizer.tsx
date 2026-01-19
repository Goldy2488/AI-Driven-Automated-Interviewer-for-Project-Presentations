import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface WaveformVisualizerProps {
  isActive?: boolean;
  bars?: number;
  className?: string;
  variant?: "default" | "listening" | "speaking";
}

export function WaveformVisualizer({
  isActive = false,
  bars = 5,
  className,
  variant = "default",
}: WaveformVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(8));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(bars).fill(8));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.random() * 24 + 8));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, bars]);

  const colorClass = {
    default: "bg-accent",
    listening: "bg-ai-listening",
    speaking: "bg-ai-speaking",
  };

  return (
    <div className={cn("flex items-center justify-center gap-0.5", className)}>
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-100",
            colorClass[variant],
            isActive && "opacity-100",
            !isActive && "opacity-50"
          )}
          style={{
            height: `${height}px`,
            transitionDelay: `${i * 20}ms`,
          }}
        />
      ))}
    </div>
  );
}
