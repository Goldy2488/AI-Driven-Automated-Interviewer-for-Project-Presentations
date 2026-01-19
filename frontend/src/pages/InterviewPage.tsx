import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { AIAvatar } from "@/components/AIAvatar";
import { ChatTimeline } from "@/components/ChatTimeline";
// import { MetricsPanel } from "@/components/MetricsPanel";
import { ScreenSharePanel } from "@/components/ScreenSharePanel";
// import { InterviewProgress } from "@/components/InterviewProgress";
import { AIStatusDisplay } from "@/components/AIStatusDisplay";
import { VoiceFeedback } from "@/components/VoiceFeedback";
// import { InterviewTips } from "@/components/InterviewTips";
import { useInterviewWithWebSocket } from "@/hooks/useInterviewWithWebSocket";
import { 
  Pause, 
  Play,
  RotateCcw, 
  Square, 
  Clock,
  Users,
  Zap,
  WifiOff,
  Loader2
} from "lucide-react";
import aiAvatar from "@/assets/ai-avatar.png";

type AIState = "idle" | "listening" | "thinking" | "speaking";

interface LocationState {
  studentName?: string;
  projectTitle?: string;
  projectType?: string;
  isDemo?: boolean;
}

const encouragementMessages = [
  "You're doing great! 🌟",
  "Keep up the excellent explanations!",
  "Great technical detail!",
  "Clear and concise — well done!",
];

export default function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  // WebSocket-based interview state
  const {
    stage: interviewStage,
    aiState,
    messages,
    isProcessing,
    isConnected,
    error: wsError,
    startInterview,
    addUserResponse,
    processPresentationData,
    completeInterview,
    retryConnection,
  } = useInterviewWithWebSocket();

  const [isMicOn, setIsMicOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [isAITyping, setIsAITyping] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Allow demo access without state
  const displayName = state?.studentName || "Demo Student";
  const displayTitle = state?.projectTitle || "E-Commerce Platform";
  const displayType = state?.projectType || "web";

  // Start interview on mount
  useEffect(() => {
    if (isConnected && !hasStarted) {
      console.log('🎬 Auto-starting interview...');
      startInterview(displayName, displayTitle);
      setHasStarted(true);
    }
  }, [isConnected, hasStarted, displayName, displayTitle, startInterview]);

  // Timer effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // AI typing indicator based on state
  useEffect(() => {
    if (aiState === "thinking") {
      setIsAITyping(true);
    } else {
      setIsAITyping(false);
    }
  }, [aiState]);

  // Show encouragement when AI is listening
  useEffect(() => {
    if (aiState === "listening" && !isPaused) {
      const timeout = setTimeout(() => {
        setEncouragement(encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]);
        setTimeout(() => setEncouragement(""), 3000);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [aiState, isPaused]);

  // Progress stage based on time
  useEffect(() => {
    if (elapsedTime > 0 && elapsedTime % 120 === 0 && currentStage < 3) {
      setCurrentStage((prev) => Math.min(prev + 1, 3));
    }
  }, [elapsedTime, currentStage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndInterview = () => {
    completeInterview();
    navigate("/evaluation", { state: { ...state, elapsedTime } });
  };

  // Handle presentation submission
  const handlePresentationComplete = (transcript: string, screenImage: string | null, ocrText: string) => {
    console.log('📊 Presentation complete, processing...');
    processPresentationData({ transcript, screenImage, ocrText });
  };

  // Allow demo access without state
  const questionTypes = ["intro", "demo", "technical", "closing"] as const;
  const currentQuestionType = questionTypes[currentStage];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnected from server</span>
            <Button size="sm" variant="secondary" onClick={retryConnection}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* WebSocket Error Banner */}
      {wsError && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 text-center">
          <span className="text-sm font-medium">{wsError}</span>
        </div>
      )}
      
      {/* Main Content */}
      <main className="pt-16 h-screen">
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Top Bar - Session Info & Progress */}
          <div className="glass-panel border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Live Interview</span>
                </div>
                <Badge variant="secondary" className="font-medium">
                  {displayTitle}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {displayType}
                </Badge>
              </div>
              <div className="flex items-center gap-6">
                {/* Encouragement message */}
                {encouragement && (
                  <div className="animate-slide-up">
                    <Badge variant="success" className="gap-1.5">
                      <Zap className="w-3 h-3" />
                      {encouragement}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{displayName}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm font-semibold text-foreground">{formatTime(elapsedTime)}</span>
                </div>
              </div>
            </div>
            
            {/* Interview Progress */}
            {/* <InterviewProgress currentStage={currentStage} /> */}
          </div>

          {/* 3-Column Layout */}
          <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
            {/* LEFT PANEL - Screen Share & Tips */}
            <div className="col-span-6 flex flex-col gap-4 overflow-hidden">
              <ScreenSharePanel 
                className="flex-1"
                onPresentationComplete={handlePresentationComplete}
              />
              {/* <InterviewTips currentQuestionType={currentQuestionType} /> */}
            </div>

            {/* CENTER PANEL - Interview */}
            <div className="col-span-6 flex flex-col overflow-hidden">
              <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden">
                {/* AI Avatar Header with Status */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-4 mb-3">
                    <AIAvatar state={aiState} imageSrc={aiAvatar} size="md" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        AI Interviewer
                        {aiState === "speaking" && (
                          <span className="text-xs font-normal text-ai-speaking animate-pulse">● Speaking</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Technical Project Evaluation
                      </p>
                    </div>
                    <Badge
                      variant={
                        aiState === "listening"
                          ? "listening"
                          : aiState === "thinking"
                          ? "thinking"
                          : aiState === "speaking"
                          ? "speaking"
                          : "secondary"
                      }
                      className="animate-pulse"
                    >
                      {aiState.charAt(0).toUpperCase() + aiState.slice(1)}
                    </Badge>
                  </div>
                  
                  {/* AI Status Display */}
                  <AIStatusDisplay state={aiState} />
                </div>

                {/* Chat Timeline */}
                <div className="flex-1 overflow-y-auto">
                  <ChatTimeline messages={messages} isAITyping={isAITyping} />
                </div>

                {/* Voice Input Section */}
                <div className="p-4 border-t border-border space-y-4">
                  <VoiceFeedback 
                    isMicOn={isMicOn}
                    isListening={aiState === "listening"}
                    isSpeaking={aiState === "speaking"}
                    onMicToggle={() => setIsMicOn(!isMicOn)}
                  />

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={isPaused ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                      className="gap-2"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4" />
                          Resume Interview
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Repeat Question
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-auto gap-2"
                      onClick={handleEndInterview}
                    >
                      <Square className="w-4 h-4" />
                      End Interview
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT PANEL - Metrics */}
            {/* <div className="col-span-3 overflow-y-auto">
              <MetricsPanel />
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}
