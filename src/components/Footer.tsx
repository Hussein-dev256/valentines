import XIcon from '../assets/icons/X.svg?react';
import IGIcon from '../assets/icons/IG.svg?react';
import TikTokIcon from '../assets/icons/Tiktok.svg?react';

export default function Footer() {
  return (
    <footer className="w-full py-3 text-center">
      <div className="flex flex-col items-center justify-center gap-3 px-2">
        {/* Romantic text with hearts */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 'clamp(14px, 2vh, 18px)', color: '#ff1744' }}>💕</span>
          <span 
            className="text-body-small" 
            style={{ 
              color: 'rgba(0, 0, 0, 0.75)', 
              fontSize: 'clamp(11px, 1.8vh, 13px)',
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '0.3px'
            }}
          >
            Made with love by Web Developer Uganda
          </span>
          <span style={{ fontSize: 'clamp(14px, 2vh, 18px)', color: '#ff1744' }}>💕</span>
        </div>
        
        {/* Social buttons with icons */}
        <div className="flex gap-2 sm:gap-3">
          <a 
            href="https://x.com/son_of_antonn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-link"
            aria-label="Follow us on X (Twitter)"
          >
            <XIcon className="footer-social-icon" />
            <span>X</span>
          </a>
          <a 
            href="https://www.instagram.com/webdeveloper.256?igsh=ZjRuaXQ3dW45OWY3" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-link"
            aria-label="Follow us on Instagram"
          >
            <IGIcon className="footer-social-icon" />
            <span>Instagram</span>
          </a>
          <a 
            href="https://tiktok.com/@webdeveloper_256" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-link"
            aria-label="Follow us on TikTok"
          >
            <TikTokIcon className="footer-social-icon" />
            <span>TikTok</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
