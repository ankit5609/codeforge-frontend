import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, ThumbsUp, ThumbsDown, Copy, RotateCcw, ImagePlus, X, Camera } from "lucide-react";
import { AttachmentImage } from "@/components/AttachmentImage";
import assistantLogo from "@/assets/assistant-logo.png";
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
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg" style={{ background: "var(--lp-bg-raised-2)" }} />
          <Skeleton className="h-3.5 w-24 rounded" style={{ background: "var(--lp-bg-raised-2)" }} />
        </div>
        <Skeleton className="h-3 w-[85%] rounded" style={{ background: "var(--lp-bg-raised-2)" }} />
        <Skeleton className="h-3 w-[70%] rounded" style={{ background: "var(--lp-bg-raised-2)" }} />
        <Skeleton className="h-3 w-[55%] rounded" style={{ background: "var(--lp-bg-raised-2)" }} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-10 w-[60%] rounded-2xl rounded-tr-none" style={{ background: "var(--lp-bg-raised-2)" }} />
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg" style={{ background: "var(--lp-bg-raised-2)" }} />
          <Skeleton className="h-3.5 w-20 rounded" style={{ background: "var(--lp-bg-raised-2)" }} />
        </div>
        <Skeleton className="h-3 w-[78%] rounded" style={{ background: "var(--lp-bg-raised-2)" }} />
        <Skeleton className="h-20 w-full rounded-xl" style={{ background: "var(--lp-bg-raised-2)" }} />
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
  events?: ChatEvent[];
  editedFiles?: string[];
  imageUrl?: string | null;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, image?: File | null) => void;
  isStreaming: boolean;
  isLoading?: boolean;
  readOnly?: boolean;
}

// Same heuristic the backend's own system prompt uses to distinguish the two
// real multimodal intents (bug-fix vs design-replication) — mirrored here
// only to label the attachment, not to change what gets sent.
const BUG_WORDS = ["bug", "error", "broken", "wrong", "issue", "crash", "fix"];
const looksLikeBugReport = (text: string) => BUG_WORDS.some((w) => text.toLowerCase().includes(w));

export function ChatPanel({ messages, onSendMessage, isStreaming, isLoading, readOnly }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const clearImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming || isLimitReached) return;
    if (!input.trim() && !image) return;

    onSendMessage(input.trim(), image);
    setInput("");
    clearImage();

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
    <div className="flex flex-col h-full" style={{ background: "var(--lp-bg)" }}>
      {/* Panel header */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-4" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised)" }}>
        <img src={assistantLogo} alt="Assistant" width={24} height={24} className="h-6 w-6 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(255,90,46,0.35))" }} />
        <span className="font-semibold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "var(--lp-ink)" }}>Assistant</span>
        <span className="text-xs" style={{ color: "var(--lp-ink-faint)" }}>· your build partner</span>
        {subscription && (
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono"
            style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised-2)", color: "var(--lp-ink-faint)" }}
            title="AI tokens used this cycle"
          >
            <span className="lp-live-dot" />
            {tokenUsage.unlimited ? "Unlimited" : `${formatNumber(tokenUsage.used)} / ${formatNumber(tokenUsage.limit)}`}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatLoadingSkeleton />
        ) : messages.length === 0 ? (
          <StateView icon={Bot} title="Let's build something" description="Describe the feature, page, or change you have in mind and I'll get to work.">
            {!readOnly && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm pt-1">
                {["Build a landing page", "Add a dashboard", "Create a contact form"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised)", color: "var(--lp-ink-faint)" }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5"
                  style={{ border: "1px dashed rgba(255,90,46,0.35)", background: "rgba(255,90,46,0.06)", color: "var(--lp-ember)" }}
                >
                  <Camera className="w-3 h-3" /> Fix a bug or copy a design from a screenshot
                </button>
              </div>
            )}
          </StateView>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} isStreaming={isStreaming && message.isStreaming} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--lp-border-soft)", background: "var(--lp-bg-raised)" }}>
        {isLimitReached && !readOnly ? (
          <div className="rounded-xl p-4 text-center space-y-3" style={{ border: "1px solid rgba(232,184,75,0.3)", background: "rgba(232,184,75,0.08)" }}>
            <div className="flex items-center justify-center gap-2 font-semibold text-sm" style={{ color: "var(--lp-brass)" }}>
              <span>⚡ Out of messages</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--lp-ink-dim)" }}>
              Resets in {hoursUntilReset} {hoursUntilReset === 1 ? 'hour' : 'hours'}. Upgrade your plan
            </p>
            <button type="button" onClick={() => (window.location.href = "/settings")} className="lp-btn lp-btn-solid !w-full !text-xs !py-2">
              Upgrade Plan
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="relative">
              {imagePreview && (
                <div className="mb-2 inline-flex items-start gap-2 rounded-lg p-2" style={{ border: "1px solid var(--lp-border)", background: "var(--lp-bg-raised-2)" }}>
                  <img src={imagePreview} alt="Attachment preview" className="h-16 w-16 rounded-md object-cover" />
                  <button type="button" onClick={clearImage} aria-label="Remove attachment" className="transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  readOnly
                    ? "You have view-only access to this project"
                    : image
                      ? "Add a message (optional) — image will be sent"
                      : "Describe what you want to build..."
                }
                className="lp-input min-h-[48px] max-h-[200px] !pl-11 !pr-12 resize-none"
                disabled={isStreaming || readOnly}
                rows={1}
              />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              <button
                type="button"
                aria-label="Attach image"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || readOnly}
                className="absolute left-2 bottom-2 h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ color: "var(--lp-ink-faint)" }}
              >
                <ImagePlus className="w-4 h-4" />
              </button>
              <button
                type="submit"
                aria-label="Send message"
                disabled={(!input.trim() && !image) || isStreaming || readOnly}
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-colors"
                style={{ background: "var(--lp-ember)", color: "#160800" }}
              >
                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs" style={{ color: "var(--lp-ink-faint)" }}>Press Enter to send, Shift+Enter for a new line</span>
              {isStreaming && (
                <span className="text-xs flex items-center gap-1 font-medium" style={{ color: "var(--lp-ink-faint)" }}>
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--lp-ember)" }} />
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

function MessageItem({ message, isStreaming }: { message: ChatMessage; isStreaming: boolean }) {
  const liveEvents = useStreamParser(message.content || "");
  const eventsToRender = (message.events && message.events.length > 0) ? message.events : liveEvents;

  const attachmentLabel = message.imageUrl ? (looksLikeBugReport(message.content || "") ? "Bug report" : "Design reference") : null;

  return (
    <div className="p-5" style={{ borderBottom: "1px solid var(--lp-border-soft)", background: message.role === 'user' ? 'var(--lp-bg-raised)' : 'var(--lp-bg)' }}>
      <div className="max-w-4xl mx-auto">
        {message.role === "user" ? (
          <div className="flex flex-col items-end gap-2">
            {message.imageUrl && (
              <div className="flex flex-col items-end gap-1.5">
                {attachmentLabel && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--lp-bg-raised-2)", color: "var(--lp-ink-faint)", border: "1px solid var(--lp-border)" }}>
                    {attachmentLabel}
                  </span>
                )}
                <AttachmentImage src={message.imageUrl} alt="User attachment" />
              </div>
            )}
            {message.content && (
              <div className="text-sm py-2.5 px-4 rounded-2xl rounded-tr-none max-w-[85%]" style={{ background: "rgba(255,90,46,0.10)", border: "1px solid rgba(255,90,46,0.2)" }}>
                <p className="leading-relaxed whitespace-pre-wrap" style={{ color: "var(--lp-ink)" }}>{message.content}</p>
              </div>
            )}
            {message.createdAt && (
              <span className="text-[10px] px-1 uppercase tracking-tight" style={{ color: "var(--lp-ink-faint)" }}>
                {format(new Date(message.createdAt), "HH:mm")}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              {eventsToRender.map((event, idx) => (
                <ChatEventRenderer key={idx} event={event} isLoading={isStreaming && idx === eventsToRender.length - 1} />
              ))}
            </div>

            {!message.isStreaming && eventsToRender.length > 0 && (
              <div className="flex items-center gap-1 pt-2">
                <button aria-label="Retry response" className="h-8 w-8 rounded-md flex items-center justify-center transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button aria-label="Good response" className="h-8 w-8 rounded-md flex items-center justify-center transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button aria-label="Bad response" className="h-8 w-8 rounded-md flex items-center justify-center transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
                <button aria-label="Copy message" className="h-8 w-8 rounded-md flex items-center justify-center transition-colors" style={{ color: "var(--lp-ink-faint)" }}>
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
