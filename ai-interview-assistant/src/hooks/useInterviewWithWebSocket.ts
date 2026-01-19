import { useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

export type InterviewStage = 'intro' | 'presentation' | 'questions' | 'completed';
export type AIState = "idle" | "listening" | "thinking" | "speaking";

export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isCurrentQuestion?: boolean;
}

export interface PresentationData {
  transcript: string;
  screenImage: string | null;
  ocrText: string;
}

export const useInterviewWithWebSocket = () => {
  const [stage, setStage] = useState<InterviewStage>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messageIdCounter = useRef(0);
  const studentInfoRef = useRef<{ name: string; projectTitle: string } | null>(null);

  // WebSocket handlers
  const handleAIMessage = useCallback((data: any) => {
    const aiMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'ai',
      content: data.content,
      timestamp: new Date(data.timestamp),
      isCurrentQuestion: true,
    };
    
    setMessages(prev => {
      // Mark previous messages as not current
      const updated = prev.map(m => ({ ...m, isCurrentQuestion: false }));
      return [...updated, aiMessage];
    });
    
    // Update stage based on AI response
    if (data.stage === 'presentation-request') {
      setStage('presentation');
    } else if (data.stage === 'questions') {
      setStage('questions');
    }
    
    setIsProcessing(false);
  }, []);

  const handleStateChange = useCallback((state: AIState) => {
    // State is managed by useWebSocket
  }, []);

  const handlePresentationAnalyzed = useCallback((data: any) => {
    const analysisMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'ai',
      content: data.analysis,
      timestamp: new Date(data.timestamp),
      isCurrentQuestion: true,
    };
    
    setMessages(prev => {
      const updated = prev.map(m => ({ ...m, isCurrentQuestion: false }));
      return [...updated, analysisMessage];
    });
    
    setStage('questions');
    setIsProcessing(false);
  }, []);

  const handleError = useCallback((error: any) => {
    setError(error.message || 'An error occurred');
    setIsProcessing(false);
    console.error('WebSocket error:', error);
  }, []);

  // Initialize WebSocket
  const { 
    isConnected, 
    aiState, 
    startInterview: wsStartInterview,
    sendUserResponse: wsSendUserResponse,
    analyzePresentation: wsAnalyzePresentation 
  } = useWebSocket({
    onMessage: handleAIMessage,
    onStateChange: handleStateChange,
    onPresentationAnalyzed: handlePresentationAnalyzed,
    onError: handleError,
  });

  // Start interview
  const startInterview = useCallback((studentName: string, projectTitle: string) => {
    if (!isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }
    
    studentInfoRef.current = { name: studentName, projectTitle };
    setStage('intro');
    setIsProcessing(true);
    setError(null);
    
    wsStartInterview(studentName, projectTitle);
  }, [isConnected, wsStartInterview]);

  // Add user response
  const addUserResponse = useCallback((content: string) => {
    const userMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => {
      const updated = prev.map(m => ({ ...m, isCurrentQuestion: false }));
      return [...updated, userMessage];
    });
    
    setIsProcessing(true);
    
    // Send to AI via WebSocket
    const context = messages.length > 0 
      ? { previousQuestion: messages[messages.length - 1]?.content }
      : undefined;
    
    wsSendUserResponse(content, stage, context);
    
    return userMessage.id;
  }, [messages, stage, wsSendUserResponse]);

  // Process presentation data
  const processPresentationData = useCallback((data: PresentationData) => {
    setPresentationData(data);
    setIsProcessing(true);
    
    wsAnalyzePresentation({
      transcript: data.transcript,
      screenImage: data.screenImage,
      ocrText: data.ocrText,
    });
  }, [wsAnalyzePresentation]);

  // Complete interview
  const completeInterview = useCallback(() => {
    const finalMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'ai',
      content: 'Thank you for the interview! Your presentation was excellent. You can now proceed to view your evaluation.',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, finalMessage]);
    setStage('completed');
  }, []);

  // Retry connection
  const retryConnection = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    // State
    stage,
    aiState,
    messages,
    presentationData,
    isProcessing,
    isConnected,
    error,
    
    // Actions
    startInterview,
    addUserResponse,
    processPresentationData,
    completeInterview,
    retryConnection,
  };
};
