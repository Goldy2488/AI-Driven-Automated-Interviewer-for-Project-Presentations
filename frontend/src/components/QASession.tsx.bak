import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Loader2, CheckCircle } from 'lucide-react';

interface Question {
  text: string;
  answered: boolean;
  answer?: string;
  feedback?: string;
}

interface QASessionProps {
  questions: string[];
  onComplete: (qaHistory: Array<{ question: string; answer: string }>) => void;
  onAnswerSubmit: (questionIndex: number, question: string, answer: string) => void;
  isProcessing: boolean;
}

export function QASession({ questions, onComplete, onAnswerSubmit, isProcessing }: QASessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [questionStates, setQuestionStates] = useState<Question[]>(
    questions.map(q => ({ text: q, answered: false }))
  );
  
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questionStates[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        setAnswer(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording && recognitionRef.current) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;

    // Update local state
    const updatedStates = [...questionStates];
    updatedStates[currentQuestionIndex] = {
      ...updatedStates[currentQuestionIndex],
      answered: true,
      answer: answer
    };
    setQuestionStates(updatedStates);

    // Send to parent/backend
    onAnswerSubmit(currentQuestionIndex, currentQuestion.text, answer);

    // Clear answer and move to next question
    setAnswer('');
    
    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 2000);
    } else {
      // All questions answered, generate report
      setTimeout(() => {
        const qaHistory = updatedStates.map(q => ({
          question: q.text,
          answer: q.answer || ''
        }));
        onComplete(qaHistory);
      }, 2000);
    }
  };

  const handleFeedbackReceived = (feedback: string) => {
    const updatedStates = [...questionStates];
    updatedStates[currentQuestionIndex].feedback = feedback;
    setQuestionStates(updatedStates);
  };

  // Listen for feedback from parent
  useEffect(() => {
    // This would be handled by parent component passing feedback via props
  }, []);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex gap-2">
          {questionStates.map((q, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                q.answered
                  ? 'bg-success text-white'
                  : idx === currentQuestionIndex
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {q.answered ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <Card variant="elevated" className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge variant="default" className="mt-1">
              Q{currentQuestionIndex + 1}
            </Badge>
            <p className="text-lg font-medium flex-1">
              {currentQuestion?.text}
            </p>
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Your Answer
              </label>
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleRecording}
                className="gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>

            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here or use voice input..."
              className="min-h-[150px] text-base"
              disabled={isProcessing}
            />

            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                Recording... Speak your answer
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || isProcessing}
              className="w-full gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {isLastQuestion ? 'Submit Final Answer' : 'Submit & Next Question'}
                </>
              )}
            </Button>
          </div>

          {/* Feedback from previous answer */}
          {currentQuestionIndex > 0 && questionStates[currentQuestionIndex - 1].feedback && (
            <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-success mb-2">
                ✓ Previous Answer Feedback:
              </p>
              <p className="text-sm text-muted-foreground">
                {questionStates[currentQuestionIndex - 1].feedback}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Answered Questions List */}
      {questionStates.some(q => q.answered) && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Answered Questions</h3>
          <div className="space-y-3">
            {questionStates.map((q, idx) =>
              q.answered ? (
                <div key={idx} className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success mt-1" />
                    <p className="text-sm font-medium flex-1">Q{idx + 1}: {q.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 line-clamp-2">
                    A: {q.answer}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
