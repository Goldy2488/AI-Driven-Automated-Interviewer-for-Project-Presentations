import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { Mic, Clock, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  codeSnippet?: string;
  timeLimit?: number;
}

export function FollowUpModal({
  isOpen,
  onClose,
  question,
  codeSnippet,
  timeLimit = 60,
}: FollowUpModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeRemaining(timeLimit);
      setIsRecording(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 10) return "text-destructive";
    if (timeRemaining <= 30) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="thinking">Follow-up Question</Badge>
            <div className={cn("flex items-center gap-2 font-mono", getTimeColor())}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <DialogTitle className="text-xl mt-4">{question}</DialogTitle>
          <DialogDescription>
            This question is based on content detected in your presentation.
          </DialogDescription>
        </DialogHeader>

        {/* Referenced Content */}
        {codeSnippet && (
          <Card variant="glass" className="p-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-3">
              <Code className="w-4 h-4" />
              Referenced Code
            </div>
            <pre className="text-sm font-mono text-foreground bg-secondary/50 p-3 rounded-lg overflow-x-auto">
              <code>{codeSnippet}</code>
            </pre>
          </Card>
        )}

        {/* Voice Input */}
        <div className="mt-6 flex flex-col items-center">
          <Button
            variant={isRecording ? "destructive" : "hero"}
            size="xl"
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "rounded-full w-20 h-20",
              isRecording && "animate-mic-pulse"
            )}
          >
            <Mic className="w-8 h-8" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {isRecording ? "Recording your answer..." : "Click to start answering"}
          </p>
          {isRecording && (
            <div className="mt-4">
              <WaveformVisualizer isActive={isRecording} bars={7} />
            </div>
          )}
        </div>

        {/* Skip Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Skip Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
