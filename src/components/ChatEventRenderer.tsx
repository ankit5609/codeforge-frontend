import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Lightbulb,
  FolderOpen,
  FileEdit,
  Loader2,
  CloudCog,
  CheckCircle2,
} from 'lucide-react';
import { ChatEvent, ChatEventType } from '@/lib/types';

/**
 * The backend's system prompt requires the model to narrate the
 * deploy-and-verify tool call as exactly `<tool args="deploy">...</tool>`.
 * That means metadata === "deploy" is a reliable, real signal (not a guess)
 * that this specific TOOL_LOG event is the "is my app actually running"
 * moment — as opposed to a normal file read. Previously every TOOL_LOG
 * rendered identically ("Read" + a generic icon), and `event.content` (the
 * actual narration, e.g. "Verifying build on GKE...") was never shown at all.
 */
const isVerifyEvent = (event: ChatEvent) => event.metadata?.trim() === 'deploy';

export const ChatEventRenderer = ({ event, isLoading }: { event: ChatEvent; isLoading?: boolean }) => {
  switch (event.type) {
    case ChatEventType.THOUGHT:
      return (
        <div className="flex items-center gap-2 text-[13px] font-normal mb-4" style={{ color: 'var(--lp-ink-faint)' }}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--lp-ember)' }} />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          <span>{event.content}</span>
        </div>
      );

    case ChatEventType.TOOL_LOG:
      if (isVerifyEvent(event)) {
        return <VerifyEventCard event={event} isLoading={isLoading} />;
      }
      return (
        <CollapsibleEvent
          icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--lp-ember)' }} /> : <FolderOpen className="w-4 h-4" />}
          label="Read"
          event={event}
        />
      );

    case ChatEventType.FILE_EDIT:
      return (
        <CollapsibleEvent
          icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--lp-ember)' }} /> : <FileEdit className="w-4 h-4" style={{ color: 'var(--lp-brass)' }} />}
          label={isLoading ? 'Editing' : 'Edited'}
          event={event}
          hideToggle
          forceSingleLine={isLoading}
        />
      );

    case ChatEventType.MESSAGE:
      return (
        <div className="prose prose-invert prose-sm max-w-none leading-relaxed mb-4" style={{ color: 'var(--lp-ink)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.content}</ReactMarkdown>
          {isLoading && <span className="inline-block w-1.5 h-4 ml-1 animate-pulse align-middle" style={{ background: 'var(--lp-ember)' }} />}
        </div>
      );

    default:
      return null;
  }
};

/**
 * The one genuinely new visual element in this pass: gives the real
 * deploy-and-verify step (Kubernetes deploy + runtime log polling) its own
 * identity instead of folding it into a generic file-read row. Uses only
 * `event.content`, which the model is already required to send.
 */
const VerifyEventCard = ({ event, isLoading }: { event: ChatEvent; isLoading?: boolean }) => {
  return (
    <div
      className="flex items-start gap-3 rounded-[12px] px-3.5 py-3 my-1"
      style={{ background: 'rgba(69,196,184,0.06)', border: '1px solid rgba(69,196,184,0.22)' }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'rgba(69,196,184,0.14)', color: 'var(--lp-teal)' }}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--lp-teal)' }}>
          <CloudCog className="w-3 h-3" /> Live verification
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--lp-ink-dim)' }}>
          {event.content || 'Verifying the build on Kubernetes...'}
        </p>
      </div>
    </div>
  );
};

const CollapsibleEvent = ({
  icon,
  label,
  event,
  hideToggle = false,
  forceSingleLine = false,
}: {
  icon: React.ReactNode;
  label: string;
  event: ChatEvent;
  hideToggle?: boolean;
  forceSingleLine?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const files =
    event.type === ChatEventType.FILE_EDIT
      ? ([event.filePath].filter(Boolean) as string[])
      : (event.metadata?.split(',') || []).filter(Boolean).map((f) => f.trim());

  if (files.length === 0) return null;

  const hasMultipleFiles = files.length > 1;
  const showButton = !hideToggle && hasMultipleFiles && !forceSingleLine;

  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="shrink-0" style={{ color: 'var(--lp-ink-faint)' }}>{icon}</div>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[13px] font-medium shrink-0" style={{ color: 'var(--lp-ink-faint)' }}>{label}</span>
            <span
              className="text-[12px] px-2 py-0.5 rounded-md font-mono truncate"
              style={{ background: 'var(--lp-bg-raised-2)', color: 'var(--lp-ink)', border: '1px solid var(--lp-border)' }}
            >
              {files[0].split('/').pop()}
            </span>
            {!isExpanded && hasMultipleFiles && (
              <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--lp-ink-faint)' }}>
                +{files.length - 1} more
              </span>
            )}
          </div>
        </div>

        {showButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[12px] font-medium px-2 py-0.5 rounded transition-colors ml-4"
            style={{ background: 'var(--lp-bg-raised)', color: 'var(--lp-ink-faint)', border: '1px solid var(--lp-border)' }}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {isExpanded && hasMultipleFiles && !forceSingleLine && (
        <div className="flex flex-col gap-2">
          {files.slice(1).map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="shrink-0 opacity-0">{icon}</div>
              <span className="text-[13px] font-medium w-8 shrink-0" style={{ color: 'var(--lp-ink-faint)' }}>{label}</span>
              <span
                className="text-[12px] px-2 py-0.5 rounded-md font-mono truncate"
                style={{ background: 'var(--lp-bg-raised-2)', color: 'var(--lp-ink)', border: '1px solid var(--lp-border)' }}
              >
                {file.split('/').pop()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
