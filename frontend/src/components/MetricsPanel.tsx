import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Brain, MessageSquare, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metric {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: "default" | "success" | "warning" | "accent";
}

interface MetricsPanelProps {
  className?: string;
}

export function MetricsPanel({ className }: MetricsPanelProps) {
  const metrics: Metric[] = [
    {
      id: "technical",
      label: "Technical Depth",
      value: 72,
      icon: <Brain className="w-4 h-4" />,
      variant: "accent",
    },
    {
      id: "clarity",
      label: "Clarity of Explanation",
      value: 85,
      icon: <MessageSquare className="w-4 h-4" />,
      variant: "success",
    },
    {
      id: "confidence",
      label: "Confidence Level",
      value: 68,
      icon: <Sparkles className="w-4 h-4" />,
      variant: "warning",
    },
    {
      id: "coverage",
      label: "Feature Coverage",
      value: 45,
      icon: <Layers className="w-4 h-4" />,
      variant: "default",
    },
  ];

  const detectedTopics = [
    "React",
    "TypeScript",
    "REST API",
    "Authentication",
    "Database",
    "UI/UX",
  ];

  const keywords = [
    "component architecture",
    "state management",
    "API integration",
    "user authentication",
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Live Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live Analysis
        </h3>
        {metrics.map((metric) => (
          <Card key={metric.id} variant="metric" className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">{metric.icon}</span>
              <span className="text-xs font-medium text-foreground">
                {metric.label}
              </span>
            </div>
            <ProgressBar
              value={metric.value}
              variant={metric.variant}
              size="sm"
              showValue={true}
            />
          </Card>
        ))}
      </div>

      {/* Detected Topics */}
      <Card variant="glass" className="p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Detected Topics
        </h4>
        <div className="flex flex-wrap gap-2">
          {detectedTopics.map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Extracted Keywords */}
      <Card variant="glass" className="p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Key Phrases
        </h4>
        <ul className="space-y-2">
          {keywords.map((keyword) => (
            <li
              key={keyword}
              className="text-sm text-foreground flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {keyword}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
