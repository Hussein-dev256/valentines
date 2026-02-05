import { useState } from 'react';
import { trackEvent, EventTypes } from '../services/analytics.service';

interface ShareInterfaceProps {
  url: string;
  title?: string;
  text?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ShareInterface({
  url,
  title = 'Will You Be My Valentine?',
  text = 'Check out this Valentine!',
  onSuccess,
  onError,
}: ShareInterfaceProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
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
    <div className="space-y-4">
      <button
        onClick={handleShare}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
      >
        Share Valentine Link
      </button>
      
      {copied && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
          Link copied to clipboard! 📋
        </div>
      )}
      
      <div className="text-center">
        <p className="text-gray-600 text-sm mb-2">Or copy the link:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleCopyToClipboard}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
