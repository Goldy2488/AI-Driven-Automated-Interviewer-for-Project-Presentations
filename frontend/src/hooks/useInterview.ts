import { useState, useCallback, useRef } from 'react';
import { analyzePresentation } from '@/api';

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

export const useInterview = () => {
  const [stage, setStage] = useState<InterviewStage>('intro');
  const [aiState, setAiState] = useState<AIState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messageIdCounter = useRef(0);

  // Initial questions when interview starts
  const startInterview = useCallback((studentName: string, projectTitle: string) => {
    const introMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'ai',
      content: `Welcome ${studentName}! I'm excited to learn about your ${projectTitle} project. Let's start with a brief introduction. Could you tell me about yourself and what problem your project solves?`,
      timestamp: new Date(),
      isCurrentQuestion: true,
    };
    
    setMessages([introMessage]);
    setStage('intro');
    setAiState('speaking');
    
    // After speaking, switch to listening
    setTimeout(() => setAiState('listening'), 3000);
  }, []);

  // Add user response
  const addUserResponse = useCallback((content: string) => {
    const userMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => prev.map(m => ({ ...m, isCurrentQuestion: false })));
    setMessages(prev => [...prev, userMessage]);
    setAiState('thinking');
    
    return userMessage.id;
  }, []);

  // Request student to start presentation
  const requestPresentation = useCallback(() => {
    setAiState('thinking');
    
    setTimeout(() => {
      const presentationRequest: Message = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'ai',
        content: `Great introduction! Now, I'd love to see your project in action. Please share your screen and walk me through a demonstration. I'll be observing your explanation, the code, and the UI. Take your time to present the key features.`,
        timestamp: new Date(),
        isCurrentQuestion: true,
      };
      
      setMessages(prev => [...prev, presentationRequest]);
      setStage('presentation');
      setAiState('speaking');
      
      // Switch to listening mode for presentation
      setTimeout(() => setAiState('listening'), 3000);
    }, 2000);
  }, []);

  // Process presentation and generate questions
  const processPresentationAndAsk = useCallback(async (
    transcript: string,
    screenImage: string | null,
    ocrText: string
  ) => {
    setIsProcessing(true);
    setAiState('thinking');
    
    try {
      // Save presentation data
      setPresentationData({ transcript, screenImage, ocrText });
      
      // Send to AI for analysis
      const analysis = await analyzePresentation({
        transcript,
        screenImage,
        ocrText,
      });
      
      // Extract questions from AI response
      // AI should return questions in the analysis
      const aiMessage: Message = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'ai',
        content: `Thank you for the excellent demonstration! I observed your presentation and have some technical questions based on what I saw:\n\n${analysis.analysis}`,
        timestamp: new Date(),
        isCurrentQuestion: true,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setStage('questions');
      setAiState('speaking');
      
      // Switch to listening for answer
      setTimeout(() => setAiState('listening'), 4000);
      
    } catch (error) {
      console.error('Error processing presentation:', error);
      
      const errorMessage: Message = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'ai',
        content: 'I apologize, I had trouble analyzing your presentation. Could you please summarize the key technical aspects of your project?',
        timestamp: new Date(),
        isCurrentQuestion: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setAiState('speaking');
      setTimeout(() => setAiState('listening'), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Ask follow-up question
  const askFollowUpQuestion = useCallback(async (previousAnswer: string) => {
    setAiState('thinking');
    
    // Generate follow-up based on answer and presentation data
    try {
      const followUpAnalysis = await analyzePresentation({
        transcript: `Previous presentation: ${presentationData?.transcript}\n\nStudent's answer: ${previousAnswer}\n\nGenerate a follow-up technical question.`,
        screenImage: presentationData?.screenImage || null,
        ocrText: presentationData?.ocrText || '',
      });
      
      const followUpMessage: Message = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'ai',
        content: followUpAnalysis.analysis,
        timestamp: new Date(),
        isCurrentQuestion: true,
      };
      
      setMessages(prev => [...prev, followUpMessage]);
      setCurrentQuestionIndex(prev => prev + 1);
      setAiState('speaking');
      
      setTimeout(() => setAiState('listening'), 3000);
      
    } catch (error) {
      console.error('Error generating follow-up:', error);
    }
  }, [presentationData]);

  // Complete interview
  const completeInterview = useCallback(() => {
    const closingMessage: Message = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'ai',
      content: `Thank you for presenting your project! You've demonstrated good technical knowledge and clear communication. I'll now compile your evaluation report.`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, closingMessage]);
    setStage('completed');
    setAiState('idle');
  }, []);

  return {
    stage,
    aiState,
    messages,
    currentQuestionIndex,
    presentationData,
    isProcessing,
    setAiState,
    startInterview,
    addUserResponse,
    requestPresentation,
    processPresentationAndAsk,
    askFollowUpQuestion,
    completeInterview,
  };
};
