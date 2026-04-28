import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

const BannerNotification = ({ notification, onClose, onTap, autoHideDuration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 50);

    // Auto hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, autoHideDuration);

    return () => clearTimeout(hideTimer);
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 350);
  };

  const handleTap = () => {
    if (onTap) {
      onTap(notification);
    }
    handleClose();
  };

  if (!notification) return null;

  return (
    <div 
      className={`ios-banner ${isVisible ? 'ios-banner-visible' : ''} ${isExiting ? 'ios-banner-exiting' : ''}`}
      onClick={handleTap}
    >
      {/* "now" timestamp — top right like real iOS */}
      <div className="ios-banner-timestamp">now</div>

      <div className="ios-banner-inner">
        {/* App icon */}
        <div className="ios-banner-app-icon">
          <DollarSign size={18} color="white" />
        </div>

        {/* App name */}
        <span className="ios-banner-app-name">TOUCH 'N GO</span>
      </div>

      {/* Title (sender/subject) — bold */}
      <div className="ios-banner-title">{notification.title}</div>

      {/* Body (preview) — truncated with ellipsis */}
      <div className="ios-banner-body">{notification.body}</div>
    </div>
  );
};

export default BannerNotification;
