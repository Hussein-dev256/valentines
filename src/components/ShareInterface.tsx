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

  // Create personalized share text
  const getShareText = () => {
    if (receiverName) {
      return `${receiverName}, will you be my Valentine? 💘`;
    }
    return text || 'Will you be my Valentine? 💘';
  };

  const handleShare = async () => {
    const shareText = getShareText();
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
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
      await navigator.clipboard.writeText(url);
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
    <div className="w-full space-y-4">
      {/* Share Button */}
      <button
        onClick={handleShare}
        className="btn-primary w-full"
      >
        Share 💌
      </button>
      
      {/* Copy Success Message */}
      {copied && (
        <div 
          className="text-center fade-in"
          style={{ 
            padding: 'clamp(12px, 2vh, 16px)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            color: 'rgba(16, 185, 129, 1)',
            fontSize: 'clamp(13px, 2vh, 14px)',
            fontWeight: '500'
          }}
        >
          Link copied! 📋
        </div>
      )}
      
      {/* Copy Link Section */}
      <div className="text-center">
        <p className="text-body mb-3" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Or copy the link:
        </p>
        
        {/* Personalized message display */}
        {receiverName && (
          <div 
            className="mb-3 p-3 rounded-lg"
            style={{ 
              background: 'rgba(236, 72, 153, 0.08)',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}
          >
            <p className="text-body-large" style={{ color: 'rgba(0, 0, 0, 0.85)', fontWeight: '500' }}>
              {receiverName}, will you be my Valentine? 💘
            </p>
            <p className="text-body-small mt-1" style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
              This is how they'll see it
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            readOnly
            className="solid-input flex-1 text-sm"
            style={{ 
              cursor: 'default',
              userSelect: 'all'
            }}
          />
          <button
            onClick={handleCopyToClipboard}
            className="btn-secondary"
            style={{
              minWidth: 'auto',
              padding: 'clamp(12px, 2vh, 16px) clamp(20px, 3.5vw, 28px)',
              whiteSpace: 'nowrap'
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
