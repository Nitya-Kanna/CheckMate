import React, { useState, useEffect } from 'react';
import { Bell, X, DollarSign, Clock } from 'lucide-react';

const NotificationScreen = ({ onNotificationClick, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      {
        id: 'notif_001',
        type: 'payment_request',
        title: 'Payment Request',
        body: 'Zin requested RM 28.00 for Sushi House',
        from: 'Zin',
        amount: 28.00,
        restaurant: 'Sushi House',
        timestamp: new Date().toISOString(),
        read: false,
        request_id: 'req_001'
      },
      {
        id: 'notif_002',
        type: 'payment_received',
        title: 'Payment Received',
        body: 'Lisa paid RM 35.00 for Pizza Hut split',
        from: 'Lisa',
        amount: 35.00,
        restaurant: 'Pizza Hut',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        request_id: 'req_002'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate to payment request
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-screen">
      <div className="notification-header">
        <div className="notification-title">
          <Bell size={24} />
          <h1>Notifications</h1>
          {unreadCount > 0 && showBadge && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <Bell size={48} className="empty-icon" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {notification.type === 'payment_request' ? (
                  <DollarSign size={24} className="icon-request" />
                ) : (
                  <DollarSign size={24} className="icon-received" />
                )}
              </div>

              <div className="notification-content">
                <div className="notification-header-row">
                  <h3>{notification.title}</h3>
                  {!notification.read && <span className="unread-dot"></span>}
                </div>
                <p className="notification-body">{notification.body}</p>
                <div className="notification-meta">
                  <Clock size={12} />
                  <span>{formatTimeAgo(notification.timestamp)}</span>
                </div>
              </div>

              <div className="notification-amount">
                <span className={notification.type === 'payment_request' ? 'amount-request' : 'amount-received'}>
                  RM {notification.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationScreen;

// Made with Bob
