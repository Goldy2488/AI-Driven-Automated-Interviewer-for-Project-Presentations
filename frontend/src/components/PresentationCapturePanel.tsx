import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Monitor, MonitorUp, MonitorOff, Loader2, Send } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface PresentationCapture {
  onPresentationComplete: (transcript: string, screenImage: string | null, ocrText: string) => void;
}

export const PresentationCapturePanel = ({ onPresentationComplete }: PresentationCapture) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript;
      setTranscript((prev) => prev + ' ' + text);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const startPresentation = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" as any },
        audio: false,
      });

      streamRef.current = stream;
      setIsSharing(true);
      startVoiceRecording();

      await new Promise(resolve => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Capture screen every 5 seconds (last capture)
      captureIntervalRef.current = setInterval(() => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          setCapturedImage(canvas.toDataURL('image/png'));
        }
      }, 5000);

      stream.getTracks()[0].onended = () => stopPresentation();
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const stopPresentation = () => {
    stopVoiceRecording();
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsSharing(false);
  };

  const extractOCRAndSubmit = async () => {
    if (!capturedImage) {
      onPresentationComplete(transcript, capturedImage, '');
      return;
    }

    setIsExtracting(true);
    try {
      const result = await Tesseract.recognize(capturedImage, 'eng');
      const extracted = result.data.text;
      setOcrText(extracted);
      onPresentationComplete(transcript, capturedImage, extracted);
    } catch (error) {
      console.error('OCR error:', error);
      onPresentationComplete(transcript, capturedImage, '');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Screen Presentation</h3>
          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                ● Recording
              </Badge>
            )}
            <Button
              variant={isSharing ? 'destructive' : 'default'}
              onClick={isSharing ? stopPresentation : startPresentation}
              size="sm"
            >
              {isSharing ? (
                <>
                  <MonitorOff className="w-4 h-4 mr-2" />
                  Stop Sharing
                </>
              ) : (
                <>
                  <MonitorUp className="w-4 h-4 mr-2" />
                  Start Presentation
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {isSharing ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Monitor className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click "Start Presentation" to begin</p>
              </div>
            </div>
          )}
        </div>

        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold mb-1">Your Explanation:</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{transcript}</p>
          </div>
        )}

        {!isSharing && transcript && (
          <Button
            onClick={extractOCRAndSubmit}
            disabled={isExtracting}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting text...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Presentation to AI
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
