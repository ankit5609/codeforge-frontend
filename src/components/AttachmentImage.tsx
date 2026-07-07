import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AttachmentImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Renders a chat attachment. If `src` looks like a local blob/data URL (the
 * user just uploaded it), we use it directly. Otherwise we fetch it through
 * the authenticated API and expose it as an object URL.
 */
export function AttachmentImage({ src, alt = "attachment", className }: AttachmentImageProps) {
  const [resolved, setResolved] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revokeUrl: string | null = null;
    let cancelled = false;

    if (src.startsWith("blob:") || src.startsWith("data:")) {
      setResolved(src);
      return;
    }

    setResolved(null);
    setFailed(false);

    api.fetchAttachment(src)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        revokeUrl = url;
        setResolved(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [src]);

  if (failed) {
    return (
      <div className={`text-xs text-muted-foreground italic ${className ?? ""}`}>
        Attachment unavailable
      </div>
    );
  }

  if (!resolved) {
    return (
      <div
        className={`w-full max-w-xs h-40 rounded-lg bg-muted/40 animate-pulse ${className ?? ""}`}
        aria-label="Loading attachment"
      />
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={`max-w-xs max-h-64 rounded-lg border border-border/40 object-cover ${className ?? ""}`}
    />
  );
}
