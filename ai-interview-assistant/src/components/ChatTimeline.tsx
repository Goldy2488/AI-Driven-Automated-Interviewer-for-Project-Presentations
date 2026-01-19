import { Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
  isCurrentQuestion?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isAI = message.role === "ai";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isAI ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ring-2 transition-all",
          isAI 
            ? message.isCurrentQuestion 
              ? "bg-primary/20 ring-primary/40" 
              : "bg-primary/10 ring-transparent"
            : "bg-gradient-to-br from-secondary to-muted ring-transparent"
        )}
      >
        {isAI ? (
          <Bot className={cn(
            "w-5 h-5 transition-colors",
            message.isCurrentQuestion ? "text-primary" : "text-primary/70"
          )} />
        ) : (
          <User className="w-5 h-5 text-foreground" />
        )}
      </div>

      {/* Message bubble */}
      <div className="flex-1 max-w-[85%]">
        {/* Role label */}
        <div className={cn(
          "text-xs font-medium mb-1 flex items-center gap-1.5",
          isAI ? "text-primary" : "text-muted-foreground text-right justify-end"
        )}>
          {isAI && message.isCurrentQuestion && (
            <Sparkles className="w-3 h-3 text-warning animate-pulse" />
          )}
          {isAI ? "AI Interviewer" : "You"}
        </div>
        
        <div
          className={cn(
            "rounded-2xl px-4 py-3 transition-all relative",
            isAI
              ? message.isCurrentQuestion
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground"
              : "bg-accent/10 text-foreground border border-accent/20"
          )}
        >
          {message.isCurrentQuestion && (
            <div className="absolute -left-1 top-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        
        <p
          className={cn(
            "text-[10px] mt-1.5",
            isAI ? "" : "text-right",
            "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

interface ChatTimelineProps {
  messages: Message[];
  className?: string;
  isAITyping?: boolean;
}

export function ChatTimeline({ messages, className, isAITyping }: ChatTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAITyping]);

  return (
    <div ref={scrollRef} className={cn("space-y-6 p-4 overflow-y-auto", className)}>
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          isLatest={index === messages.length - 1}
        />
      ))}
      
      {isAITyping && (
        <div className="flex gap-3 animate-slide-up">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/40">
            <Bot className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              AI is typing...
            </p>
            <div className="bg-secondary rounded-2xl px-4 py-3 inline-flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
