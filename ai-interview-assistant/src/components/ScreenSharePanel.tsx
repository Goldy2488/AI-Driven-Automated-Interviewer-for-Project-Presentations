import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Code, Presentation, Loader2, MonitorUp, MonitorOff, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Tesseract from 'tesseract.js';
import { analyzePresentation } from "@/api/presentationApi";

interface ScreenSharePanelProps {
  className?: string;
  onPresentationComplete?: (transcript: string, screenImage: string | null, ocrText: string) => void;
}

export function ScreenSharePanel({ className, onPresentationComplete }: ScreenSharePanelProps) {
  const [activeTab, setActiveTab] = useState("ui");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [screenAnalysis, setScreenAnalysis] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string>("");
  const [isExtractingText, setIsExtractingText] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasVideoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Process voice and image with AI
  const extractTextFromImage = async () => {
    if (!capturedImage) {
      console.log("No image to extract text from");
      return;
    }

    setIsExtractingText(true);
    try {
      console.log("Starting OCR extraction...");
      const result = await Tesseract.recognize(
        capturedImage,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      const extractedText = result.data.text;
      setOcrText(extractedText);
      console.log("OCR Text extracted:", extractedText);
    } catch (error) {
      console.error("OCR Error:", error);
      setOcrText("Failed to extract text from image");
    } finally {
      setIsExtractingText(false);
    }
  };

  const processVoiceAndImage = async () => {
    if (!transcript && !capturedImage && !ocrText) {
      console.log("No data to process");
      return;
    }

    // Extract text from image first if not already done
    if (capturedImage && !ocrText && !isExtractingText) {
      await extractTextFromImage();
    }

    setIsProcessing(true);
    try {
      // If callback provided, use WebSocket flow
      if (onPresentationComplete) {
        onPresentationComplete(
          transcript || "",
          capturedImage,
          ocrText || ""
        );
        console.log("✅ Presentation data sent via WebSocket");
      } else {
        // Fallback to REST API
        const data = await analyzePresentation({
          transcript: transcript || undefined,
          screenImage: capturedImage,
          ocrText: ocrText || "Extracting text from screen...",
        });
        
        setScreenAnalysis(data.analysis);
        console.log("Analysis received:", data);
      }
    } catch (error) {
      console.error("Failed to process data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setScreenAnalysis(`Failed to analyze presentation: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start voice recognition
  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcriptText = lastResult[0].transcript;
      setTranscript((prev) => prev + " " + transcriptText);
      console.log("Voice captured:", transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Restart if still recording
      if (isRecordingVoice && recognitionRef.current) {
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecordingVoice(true);
    console.log("Voice recording started");
  };

  // Stop voice recognition
  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecordingVoice(false);
    console.log("Voice recording stopped. Transcript:", transcript);
  };

  const startScreenShare = async () => {
    try {
      setShareError(null);
      console.log("Starting screen share...");
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always" as any
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      // Set state first to render the video element
      setIsSharing(true);
      
      // Start voice recording automatically
      startVoiceRecording();
      
      // Wait for next tick to ensure video element is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set the visible video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video srcObject set to videoRef");
        
        // Force play
        try {
          await videoRef.current.play();
          console.log("Video is playing");
        } catch (e) {
          console.error("Error playing video:", e);
        }
      } else {
        console.error("videoRef.current is null!");
      }
      
      // Use the same video ref for canvas capture
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Wait a bit before starting capture
      setTimeout(() => {
        setIsAnalyzing(true);
        
        // Start capturing images every second
        captureIntervalRef.current = setInterval(() => {
          if (!ctx || !videoRef.current) {
            console.log("Canvas context or video not ready");
            return;
          }
          
          const width = videoRef.current.videoWidth;
          const height = videoRef.current.videoHeight;
          
          if (width === 0 || height === 0) {
            console.log("Video dimensions not ready yet:", width, height);
            return;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(videoRef.current, 0, 0);
          const image = canvas.toDataURL("image/png");
          
          setCapturedImage(image);
          console.log("Screen captured successfully, dimensions:", width, "x", height);
        }, 1000);
        
        // Analysis complete after 2 seconds
        setTimeout(() => {
          setIsAnalyzing(false);
        }, 2000);
      }, 500);

      // Detect when user stops screen sharing from browser controls
      stream.getTracks()[0].onended = () => {
        console.log("Screen share ended by user");
        stopScreenShare();
      };
      
    } catch (error) {
      console.error("Screen share error:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setShareError("Screen sharing was denied. Please allow screen sharing to continue.");
        } else if (error.name === "NotFoundError") {
          setShareError("No screen available to share.");
        } else {
          setShareError(`Failed to start screen sharing: ${error.message}`);
        }
      }
    }
  };

  const stopScreenShare = () => {
    console.log("Stopping screen share...");
    
    // Stop voice recording
    stopVoiceRecording();
    
    // Clear the capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    // Stop all stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    
    // Clean up video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    setIsSharing(false);
    setIsAnalyzing(false);
    setShareError(null);
    setCapturedImage(null);
    
    // Optionally auto-analyze after stopping
    if (transcript || capturedImage) {
      console.log("Presentation stopped. Click 'Convert to Text' to analyze.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Card variant="elevated" className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Project View</h3>
        <div className="flex items-center gap-2">
          {isRecordingVoice && (
            <Badge variant="destructive" className="animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Recording Voice
            </Badge>
          )}
          {isSharing && (
            <Badge variant={isAnalyzing ? "thinking" : "success"}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Analyzing screen...
                </>
              ) : (
                "Analysis complete"
              )}
            </Badge>
          )}
          <Button
            size="sm"
            variant={isSharing ? "destructive" : "default"}
            onClick={isSharing ? stopScreenShare : startScreenShare}
            className="gap-2"
          >
            {isSharing ? (
              <>
                <MonitorOff className="w-4 h-4" />
                Stop Sharing
              </>
            ) : (
              <>
                <MonitorUp className="w-4 h-4" />
                Share Screen
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger
            value="ui"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
          >
            <Monitor className="w-4 h-4 mr-2" />
            UI View
          </TabsTrigger>
          {/* <TabsTrigger
            value="code"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
          >
            <Code className="w-4 h-4 mr-2" />
            Code Snippet
          </TabsTrigger> */}
          {/* <TabsTrigger
            value="slides"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
          >
            <Presentation className="w-4 h-4 mr-2" />
            
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="ui" className="m-0">
          <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
            {isSharing ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ backgroundColor: '#000' }}
              />
            ) : (
              <div className="text-center space-y-4 p-8">
                {shareError ? (
                  <>
                    <AlertCircle className="w-16 h-16 mx-auto text-destructive/70" />
                    <p className="text-destructive text-sm max-w-xs mx-auto">
                      {shareError}
                    </p>
                    <Button onClick={startScreenShare} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </>
                ) : (
                  <>
                    <Monitor className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">
                      Screen share preview will appear here
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Click "Share Screen" to begin the presentation
                    </p>
                    <Button onClick={startScreenShare} className="mt-2 gap-2">
                      <MonitorUp className="w-4 h-4" />
                      Share Screen
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* <TabsContent value="code" className="m-0">
          <div className="bg-foreground/5 p-4 overflow-auto max-h-80">
            <pre className="text-sm font-mono text-foreground leading-relaxed">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </TabsContent> */}

        {/* <TabsContent value="slides" className="m-0">
          <div className="aspect-video bg-secondary flex items-center justify-center">
            <div className="text-center space-y-3 p-8">
              <Presentation className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">
                Slide deck view
              </p>
            </div>
          </div>
        </TabsContent> */}

      </Tabs>
      
      {/* Transcript Display */}
      {transcript && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Voice Transcript
            </h4>
            <div className="flex gap-2">
              {capturedImage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={extractTextFromImage}
                  disabled={isExtractingText}
                  className="gap-2"
                >
                  {isExtractingText ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      Extract Screen Text
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                onClick={processVoiceAndImage}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Code className="w-3 h-3" />
                    Analyze All
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="bg-background rounded-md p-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-foreground/80 leading-relaxed">
              {transcript}
            </p>
          </div>
        </div>
      )}
      
      {/* OCR Text Display */}
      {ocrText && (
        <div className="border-t border-border bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Extracted Text from Screen (OCR)
          </h4>
          <div className="bg-background rounded-md p-3 max-h-40 overflow-y-auto">
            <pre className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono">
              {ocrText}
            </pre>
          </div>
        </div>
      )}
      
      {/* AI Analysis Result */}
      {screenAnalysis && (
        <div className="border-t border-border bg-purple-50/50 dark:bg-purple-950/20 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-600" />
            AI Analysis
          </h4>
          <div className="bg-background rounded-md p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {screenAnalysis}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
