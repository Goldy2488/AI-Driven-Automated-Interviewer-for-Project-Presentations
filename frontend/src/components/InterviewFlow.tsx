import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useInterview } from '@/hooks/useInterview';

interface InterviewFlowProps {
  onPresentationReady: (transcript: string, screenImage: string | null, ocrText: string) => void;
}

export const InterviewFlow = ({ onPresentationReady }: InterviewFlowProps) => {
  const {
    stage,
    aiState,
    messages,
    isProcessing,
    addUserResponse,
    requestPresentation,
  } = useInterview();
  
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSendResponse = () => {
    if (!userInput.trim()) return;
    
    addUserResponse(userInput);
    setUserInput('');
    
    // After intro response, request presentation
    if (stage === 'intro') {
      setTimeout(() => requestPresentation(), 2000);
    }
  };

  const handleStartPresentation = () => {
    // Signal parent that presentation is starting
    // Parent will handle screen share and voice recording
  };

  return (
    <div className="space-y-4">
      {/* Stage Indicator */}
      <div className="flex items-center gap-2">
        <Badge variant={stage === 'intro' ? 'default' : 'secondary'}>
          Introduction
        </Badge>
        <div className="h-px flex-1 bg-border" />
        <Badge variant={stage === 'presentation' ? 'default' : 'secondary'}>
          Presentation
        </Badge>
        <div className="h-px flex-1 bg-border" />
        <Badge variant={stage === 'questions' ? 'default' : 'secondary'}>
          Q&A
        </Badge>
      </div>

      {/* Messages Display */}
      <Card className="p-4 max-h-96 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.isCurrentQuestion && (
                <Badge variant="outline" className="mt-2">
                  Current Question
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">AI is analyzing...</span>
            </div>
          </div>
        )}
      </Card>

      {/* Input Area */}
      {stage !== 'presentation' && aiState === 'listening' && (
        <div className="flex gap-2">
          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            size="icon"
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
            placeholder="Type your response or use voice..."
            className="flex-1 px-4 py-2 rounded-lg border bg-background"
          />
          <Button onClick={handleSendResponse} disabled={!userInput.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Presentation Stage Button */}
      {stage === 'presentation' && (
        <Button
          onClick={handleStartPresentation}
          className="w-full"
          size="lg"
        >
          Start Screen Share & Presentation
        </Button>
      )}
    </div>
  );
};
