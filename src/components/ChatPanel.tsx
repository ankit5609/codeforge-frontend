import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, ThumbsUp, ThumbsDown, Copy, RotateCcw, MoreHorizontal, FileCode, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StateView } from "@/components/StateView";
import { format } from "date-fns";
import { useStreamParser } from "../hooks/use-stream-parser";
import { ChatEventRenderer } from './ChatEventRenderer';
import { ChatEvent, SubscriptionResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { deriveTokenUsage, formatNumber } from "@/lib/usage";

function ChatLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-5" aria-hidden="true">
      {/* incoming bubble */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
        <Skeleton className="h-3 w-[85%] rounded" />
        <Skeleton className="h-3 w-[70%] rounded" />
        <Skeleton className="h-3 w-[55%] rounded" />
      </div>
      {/* outgoing bubble */}
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-10 w-[60%] rounded-2xl rounded-tr-none" />
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="h-3.5 w-20 rounded" />
        </div>
        <Skeleton className="h-3 w-[78%] rounded" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  createdAt?: string;
  events?: ChatEvent[]; // Structured events from the database
  editedFiles?: string[];
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function ChatPanel({ messages, onSendMessage, isStreaming, isLoading, readOnly }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchSubscription = () => {
    api.getCurrentSubscription()
      .then((s) => setSubscription(s))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      fetchSubscription();
    }
  }, [isStreaming]);

  const tokenUsage = deriveTokenUsage(subscription);
  const isLimitReached = !tokenUsage.unlimited && tokenUsage.limit > 0 && tokenUsage.used >= tokenUsage.limit;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || isLimitReached) return;

    onSendMessage(input.trim());
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const hoursUntilReset = 24 - new Date().getUTCHours();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Panel header */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-4 border-b border-border/60 bg-panel">
        <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-display font-semibold text-sm text-foreground">Assistant</span>
        <span className="text-xs text-muted-foreground">· your build partner</span>
        {subscription && (
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
            title="AI tokens used this cycle"
          >
            <Zap className="h-3 w-3 text-primary" />
            {tokenUsage.unlimited
              ? "Unlimited"
              : `${formatNumber(tokenUsage.used)} / ${formatNumber(tokenUsage.limit)}`}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatLoadingSkeleton />
        ) : messages.length === 0 ? (
          <StateView
            icon={Bot}
            title="Let's build something"
            description="Describe the feature, page, or change you have in mind and I'll get to work."
          >
            {!readOnly && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm pt-1">
                {["Build a landing page", "Add a dashboard", "Create a contact form"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </StateView>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message}
                isStreaming={isStreaming && message.isStreaming} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 border-t border-border/60 bg-card">
        {isLimitReached && !readOnly ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-500 font-semibold text-sm">
              <Zap className="h-4.5 w-4.5 fill-amber-500" />
              <span>Out of messages</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Resets in {hoursUntilReset} {hoursUntilReset === 1 ? 'hour' : 'hours'}. Upgrade your plan
            </p>
            <Button
              type="button"
              onClick={() => window.location.href = "/settings"}
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-lg text-xs py-2 transition-colors active:scale-[0.98]"
            >
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={readOnly ? "You have view-only access to this project" : "Describe what you want to build..."}
                className="min-h-[48px] max-h-[200px] pr-12 resize-none bg-muted/30 border-border/30 focus:border-primary/50 rounded-xl text-sm"
                disabled={isStreaming || readOnly}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={!input.trim() || isStreaming || readOnly}
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for a new line</span>
              </div>
              {isStreaming && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  Thinking...
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Inner Component to handle logic per message
function MessageItem({ message, isStreaming }: { message: ChatMessage, isStreaming: boolean }) {
  // Use the stream parser to turn raw XML text into Event objects live
  // 1. Parse content live if we are streaming OR if we don't have DB events yet
  const liveEvents = useStreamParser(message.content || "");

  // 2. Logic: If we have DB events, use them. Otherwise, use the parsed content.
  const eventsToRender = (message.events && message.events.length > 0)
    ? message.events
    : liveEvents;

  return (
    <div className={`p-5 border-b border-border/10 ${message.role === 'user' ? 'bg-muted/10' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto">
        {message.role === "user" ? (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-primary/10 text-primary-foreground text-sm py-2.5 px-4 rounded-2xl rounded-tr-none border border-primary/20 max-w-[85%]">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.createdAt && (
              <span className="text-[10px] text-muted-foreground px-1 uppercase tracking-tight">
                {format(new Date(message.createdAt), "HH:mm")}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Render granular events (Thought, Tool, Message, File) */}
            <div className="flex flex-col gap-3">
              {eventsToRender.map((event, idx) => {
                const isLast = idx === eventsToRender.length - 1;
                return (
                  <ChatEventRenderer
                    key={idx}
                    event={event}
                    // It is "loading" only if:
                    // 1. The message is currently streaming
                    // 2. AND this is the last event in the list
                    isLoading={isStreaming && isLast}
                  />
                );
              })}
            </div>

            {/* Action buttons for assistant message */}
            {!message.isStreaming && eventsToRender.length > 0 && (
              <div className="flex items-center gap-1 pt-2">
                <Button variant="ghost" size="icon" aria-label="Retry response" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Good response" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <ThumbsUp className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Bad response" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Copy message" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
