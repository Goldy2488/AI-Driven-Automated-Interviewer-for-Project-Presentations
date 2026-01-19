import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type AIState = "idle" | "listening" | "thinking" | "speaking" | "analyzing";

interface UseWebSocketProps {
  onMessage?: (data: any) => void;
  onStateChange?: (state: AIState) => void;
  onPresentationAnalyzed?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useWebSocket = ({
  onMessage,
  onStateChange,
  onPresentationAnalyzed,
  onError
}: UseWebSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [aiState, setAiState] = useState<AIState>("idle");

  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    
    // Create socket connection with better configuration
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ WebSocket connected', socket.id);
      setIsConnected(true);
    });

    // Connection acknowledgment from server
    socket.on('connection_ack', (data) => {
      console.log('🤝 Connection acknowledged:', data);
    });

    // Disconnected
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setIsConnected(false);
      onError?.({ message: 'Connection failed. Is the backend server running on port 5000?', details: error.message });
    });

    // AI message handler
    socket.on('ai_message', (data) => {
      console.log('💬 AI message received:', data);
      onMessage?.(data);
    });

    // AI state change handler
    socket.on('ai_state_change', (data) => {
      console.log('🔄 AI state changed:', data.state);
      setAiState(data.state);
      onStateChange?.(data.state);
    });

    // Questions generated after presentation
    socket.on('questions_generated', (data) => {
      console.log('❓ Questions generated:', data);
      onPresentationAnalyzed?.(data);
    });

    // Presentation analyzed handler (legacy)
    socket.on('presentation_analyzed', (data) => {
      console.log('🎥 Presentation analyzed:', data);
      onPresentationAnalyzed?.(data);
    });

    // Interview error handler
    socket.on('interview_error', (error) => {
      console.error('❌ Interview error:', error);
      onError?.(error);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      onError?.(error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [onMessage, onStateChange, onPresentationAnalyzed, onError]);

  // Start interview
  const startInterview = useCallback((studentName: string, projectTitle: string) => {
    if (socketRef.current?.connected) {
      console.log('🎬 Starting interview via WebSocket...', { studentName, projectTitle });
      socketRef.current.emit('start_interview', { studentName, projectTitle });
    } else {
      console.error('❌ WebSocket not connected');
    }
  }, []);

  // Send user response
  const sendUserResponse = useCallback((content: string, stage: string, context?: any) => {
    if (socketRef.current?.connected) {
      console.log('💬 Sending user response via WebSocket...');
      socketRef.current.emit('user_response', { message: content, stage, context });
    } else {
      console.error('❌ WebSocket not connected');
    }
  }, []);

  // Analyze presentation
  const analyzePresentation = useCallback((data: {
    transcript?: string;
    screenImage?: string | null;
    ocrText?: string;
  }) => {
    if (socketRef.current?.connected) {
      console.log('🎥 Sending presentation for analysis via WebSocket...', {
        hasTranscript: !!data.transcript,
        hasScreenImage: !!data.screenImage,
        hasOcrText: !!data.ocrText
      });
      socketRef.current.emit('presentation_data', data);
    } else {
      console.error('❌ WebSocket not connected');
    }
  }, []);

  return {
    isConnected,
    aiState,
    startInterview,
    sendUserResponse,
    analyzePresentation,
    socket: socketRef.current,
  };
};
