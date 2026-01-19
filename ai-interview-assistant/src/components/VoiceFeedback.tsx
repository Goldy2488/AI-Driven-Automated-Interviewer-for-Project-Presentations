import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface VoiceFeedbackProps {
  isMicOn: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onMicToggle: () => void;
  className?: string;
}

export function VoiceFeedback({ 
  isMicOn, 
  isListening, 
  isSpeaking, 
  onMicToggle, 
  className 
}: VoiceFeedbackProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Mic Button with visual feedback */}
      <div className="relative">
        {isListening && isMicOn && (
          <>
            <div className="absolute inset-0 rounded-full bg-ai-listening/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-ai-listening/20 animate-pulse scale-125" />
          </>
        )}
        <Button
          variant={isMicOn ? "default" : "secondary"}
          size="icon"
          onClick={onMicToggle}
          className={cn(
            "relative w-14 h-14 rounded-full transition-all duration-300",
            isMicOn && isListening && "bg-ai-listening hover:bg-ai-listening/90 shadow-lg",
            isMicOn && !isListening && "bg-primary",
            !isMicOn && "bg-muted"
          )}
        >
          {isMicOn ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Status and waveform */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium transition-colors",
              isListening && isMicOn ? "text-ai-listening" : 
              isSpeaking ? "text-ai-speaking" : 
              "text-foreground"
            )}>
              {!isMicOn 
                ? "Microphone is off" 
                : isListening 
                ? "🎙️ Speak now..." 
                : isSpeaking 
                ? "🔊 AI is speaking..." 
                : "Ready for your response"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {!isMicOn 
                ? "Click to enable microphone" 
                : isListening 
                ? "Your voice is being captured" 
                : isSpeaking 
                ? "Listen carefully to the question" 
                : "Waiting for next question"
              }
            </p>
          </div>
          
          {(isListening && isMicOn) && (
            <WaveformVisualizer isActive bars={8} className="h-8" />
          )}
        </div>

        {/* Visual indicator bar */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              isListening && isMicOn && "bg-ai-listening animate-pulse w-full",
              isSpeaking && "bg-ai-speaking w-3/4",
              !isListening && !isSpeaking && isMicOn && "bg-primary/30 w-1/4"
            )}
          />
        </div>
      </div>

      {/* Speaker indicator */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
        isSpeaking ? "bg-ai-speaking/20 text-ai-speaking" : "bg-muted text-muted-foreground"
      )}>
        {isSpeaking ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </div>
    </div>
  );
}
