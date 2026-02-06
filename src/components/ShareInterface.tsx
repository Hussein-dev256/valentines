import { useState } from 'react';
import { trackEvent, EventTypes } from '../services/analytics.service';

interface ShareInterfaceProps {
  url: string;
  receiverName?: string;
  title?: string;
  text?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ShareInterface({
  url,
  receiverName,
  title = 'Will You Be My Valentine?',
  text,
  onSuccess,
  onError,
}: ShareInterfaceProps) {
  const [copied, setCopied] = useState(false);

  // Sanitize receiver name
  const safeName = receiverName?.trim() || '';

  // Create personalized share text
  const getShareText = () => {
    if (safeName) {
      return `${safeName}, will you be my Valentine? 💘`;
    }
    return text || 'Will you be my Valentine? 💘';
  };

  // Create personalized link text
  const getLinkText = () => {
    if (safeName) {
      return `${safeName}, will you be my Valentine? 💖`;
    }
    return 'Click here to open your Valentine 💖';
  };

  const handleShare = async () => {
    const shareText = getShareText();
    
    // Try native share first
    if (navigator.share) {
      try {
        // Share ONLY the text with embedded URL - no separate url parameter
        // This ensures the share shows: "Name, will you be my Valentine? 💘 [URL]"
        // instead of showing text and URL separately
        await navigator.share({
          title,
          text: `${shareText} ${url}`,
        });
        
        trackEvent(EventTypes.SHARE_TRIGGERED);
        onSuccess?.();
      } catch (error) {
        // User cancelled or share failed
        if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled, don't show error
          return;
        }
        
        // Share failed, fallback to clipboard
        await handleCopyToClipboard();
      }
    } else {
      // No native share, use clipboard
      await handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      // Copy the personalized text with URL embedded
      const shareText = getShareText();
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      trackEvent(EventTypes.SHARE_FALLBACK);
      
      setTimeout(() => setCopied(false), 3000);
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to copy');
      onError?.(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Personalized Clickable Link - NO RAW URL */}
      <div className="text-center fade-in" style={{ animationDelay: '0.1s' }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="valentine-link"
          style={{
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: 'clamp(15px, 2.5vh, 18px)',
            color: 'rgba(0, 0, 0, 0.85)',
            cursor: 'pointer',
            display: 'inline-block',
            padding: 'clamp(12px, 2vh, 16px) clamp(20px, 3.5vw, 28px)',
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            borderRadius: '12px',
            transition: 'all 300ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {getLinkText()}
        </a>
        <p 
          className="text-body-small mt-3" 
          style={{ 
            color: 'rgba(0, 0, 0, 0.45)',
            fontStyle: 'italic'
          }}
        >
          Click to preview • Share to send
        </p>
      </div>
      
      {/* PRIMARY CTA - Share Button */}
      <button
        onClick={handleShare}
        className="btn-primary w-full fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        Share 💌
      </button>
      
      {/* Copy Success Toast - Minimal */}
      {copied && (
        <div 
          className="text-center fade-in"
          style={{ 
            padding: 'clamp(10px, 1.8vh, 14px)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            color: 'rgba(16, 185, 129, 1)',
            fontSize: 'clamp(12px, 1.9vh, 14px)',
            fontWeight: '500'
          }}
        >
          Link copied 💕
        </div>
      )}
    </div>
  );
}
