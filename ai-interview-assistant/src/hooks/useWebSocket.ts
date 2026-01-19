import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type AIState = "idle" | "listening" | "thinking" | "speaking";

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
    // Connect to WebSocket server
    const socket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected', socket.id);
      setIsConnected(true);
    });

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
    socket.on('ai-message', (data) => {
      console.log('💬 AI message received:', data);
      onMessage?.(data);
    });

    // AI state change handler
    socket.on('ai-state-change', (data) => {
      console.log('🔄 AI state changed:', data.state);
      setAiState(data.state);
      onStateChange?.(data.state);
    });

    // Presentation analyzed handler
    socket.on('presentation-analyzed', (data) => {
      console.log('🎥 Presentation analyzed:', data);
      onPresentationAnalyzed?.(data);
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
      console.log('🎬 Starting interview via WebSocket...');
      socketRef.current.emit('start-interview', { studentName, projectTitle });
    } else {
      console.error('❌ WebSocket not connected');
    }
  }, []);

  // Send user response
  const sendUserResponse = useCallback((content: string, stage: string, context?: any) => {
    if (socketRef.current?.connected) {
      console.log('💬 Sending user response via WebSocket...');
      socketRef.current.emit('user-response', { content, stage, context });
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
      console.log('🎥 Sending presentation for analysis via WebSocket...');
      socketRef.current.emit('analyze-presentation', data);
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
