import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { AIAvatar } from "@/components/AIAvatar";
import { ChatTimeline } from "@/components/ChatTimeline";
import { PresentationCapturePanel } from "@/components/PresentationCapturePanel";
import { useInterview } from "@/hooks/useInterview";
import { 
  Square, 
  Clock,
  Users,
  Mic,
  MicOff,
  Send
} from "lucide-react";
import aiAvatar from "@/assets/ai-avatar.png";

interface LocationState {
  studentName?: string;
  projectTitle?: string;
  projectType?: string;
}

export default function InterviewPageNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const {
    stage,
    aiState,
    messages,
    isProcessing,
    startInterview,
    addUserResponse,
    requestPresentation,
    processPresentationAndAsk,
    askFollowUpQuestion,
    completeInterview,
  } = useInterview();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const recognitionRef = useState<any>(null);

  const displayName = state?.studentName || "Demo Student";
  const displayTitle = state?.projectTitle || "E-Commerce Platform";
  const displayType = state?.projectType || "web";

  // Start interview on mount
  useEffect(() => {
    startInterview(displayName, displayTitle);
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendResponse = () => {
    if (!userInput.trim()) return;
    
    addUserResponse(userInput);
    setUserInput('');
    
    // After intro, request presentation
    if (stage === 'intro') {
      setTimeout(() => requestPresentation(), 2000);
    } else if (stage === 'questions') {
      // After answering question, ask follow-up
      setTimeout(() => askFollowUpQuestion(userInput), 2000);
    }
  };

  const handlePresentationComplete = async (
    transcript: string,
    screenImage: string | null,
    ocrText: string
  ) => {
    await processPresentationAndAsk(transcript, screenImage, ocrText);
  };

  const handleEndInterview = () => {
    completeInterview();
    setTimeout(() => {
      navigate("/evaluation", { state: { ...state, elapsedTime } });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 h-screen">
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Top Bar */}
          <div className="glass-panel border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">Live Interview</span>
                </div>
                <Badge variant="secondary">{displayTitle}</Badge>
                <Badge variant="outline" className="capitalize">{displayType}</Badge>
              </div>
              <div className="flex items-center gap-6">
                {/* Interview Stage */}
                <div className="flex items-center gap-2">
                  <Badge variant={stage === 'intro' ? 'default' : 'secondary'}>
                    Intro
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant={stage === 'presentation' ? 'default' : 'secondary'}>
                    Present
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant={stage === 'questions' ? 'default' : 'secondary'}>
                    Q&A
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{displayName}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm font-semibold">{formatTime(elapsedTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
            {/* LEFT: Presentation/Screen Share */}
            <div className="flex flex-col">
              {stage === 'presentation' ? (
                <PresentationCapturePanel 
                  onPresentationComplete={handlePresentationComplete}
                />
              ) : (
                <Card className="flex-1 p-6 flex items-center justify-center text-center">
                  <div>
                    <div className="text-6xl mb-4">
                      {stage === 'intro' && '👋'}
                      {stage === 'questions' && '💬'}
                      {stage === 'completed' && '✅'}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {stage === 'intro' && 'Introduction Phase'}
                      {stage === 'questions' && 'Technical Q&A'}
                      {stage === 'completed' && 'Interview Complete'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stage === 'intro' && 'Answer the AI\'s questions to begin'}
                      {stage === 'questions' && 'Answer technical questions about your project'}
                      {stage === 'completed' && 'Thank you for your time!'}
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* RIGHT: Chat Interface */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden">
                {/* AI Avatar Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-4">
                    <AIAvatar state={aiState} imageSrc={aiAvatar} size="md" />
                    <div className="flex-1">
                      <h3 className="font-semibold">AI Interviewer</h3>
                      <p className="text-sm text-muted-foreground">
                        Technical Project Evaluation
                      </p>
                    </div>
                    <Badge
                      variant={
                        aiState === "listening" ? "listening" :
                        aiState === "thinking" ? "thinking" :
                        aiState === "speaking" ? "speaking" : "secondary"
                      }
                    >
                      {aiState.charAt(0).toUpperCase() + aiState.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  <ChatTimeline messages={messages} isAITyping={isProcessing} />
                </div>

                {/* Input Area */}
                {stage !== 'presentation' && stage !== 'completed' && (
                  <div className="p-4 border-t space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={isMicOn ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={() => setIsMicOn(!isMicOn)}
                      >
                        {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
                        placeholder="Type your response..."
                        className="flex-1 px-4 py-2 rounded-lg border bg-background"
                        disabled={aiState !== 'listening'}
                      />
                      <Button 
                        onClick={handleSendResponse} 
                        disabled={!userInput.trim() || aiState !== 'listening'}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full gap-2"
                      onClick={handleEndInterview}
                    >
                      <Square className="w-4 h-4" />
                      End Interview
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
