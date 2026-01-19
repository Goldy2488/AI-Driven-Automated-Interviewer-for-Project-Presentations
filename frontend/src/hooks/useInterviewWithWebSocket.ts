import { useState, useCallback, useRef } from 'react';
import { useWebSocket, AIState } from './useWebSocket';

export type InterviewStage = 'intro' | 'presentation' | 'questions' | 'completed';

export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isCurrentQuestion?: boolean;
  questions?: string[]; // Array of questions for Q&A stage
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
    console.log('💬 AI message handler called with data:', data);
    
    const aiMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'ai',
      content: data.message || data.content || 'AI response received',
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
    console.log('📊 Presentation analyzed data received:', data);
    
    // Check if we have questions array (new format)
    if (data.questions && Array.isArray(data.questions)) {
      console.log(`✅ Received ${data.questions.length} questions`);
      
      // Create a message with all questions
      const questionsMessage: Message = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'ai',
        content: `Thank you for your presentation! Now I'd like to ask you ${data.questions.length} technical questions:\n\n` +
                 data.questions.map((q: string, i: number) => `**Question ${i + 1}:** ${q}`).join('\n\n'),
        timestamp: new Date(data.timestamp),
        isCurrentQuestion: true,
        questions: data.questions, // Store questions array for later use
      };
      
      setMessages(prev => {
        const updated = prev.map(m => ({ ...m, isCurrentQuestion: false }));
        return [...updated, questionsMessage];
      });
      
      setStage('questions');
      setIsProcessing(false);
    } 
    // Fallback for old analysis format
    else if (data.analysis) {
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
    } else {
      console.error('❌ Unexpected presentation data format:', data);
      setError('Failed to process presentation analysis');
      setIsProcessing(false);
    }
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
