import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, FileText, CreditCard, X } from 'lucide-react';

const PaymentRequestScreen = ({ requestId, request: requestFromProps, onBack, onPay, onDecline }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Use real incoming request data when available.
    if (requestFromProps) {
      setRequest(requestFromProps);
      setLoading(false);
      return;
    }

    // Fallback mock request for manual testing only.
    setRequest({
      request_id: requestId || 'req_001',
      from_user: {
        user_id: 'user_123',
        name: 'Zin',
        phone: '+60123456789',
        avatar: '👤'
      },
      to_user: {
        user_id: 'user_456',
        name: 'Lisa',
        phone: '+60198765432'
      },
      amount: 28.0,
      currency: 'MYR',
      description: 'Sushi House - Salmon Sashimi',
      items: [
        {
          name: 'Salmon Sashimi',
          price: 28.0
        }
      ],
      restaurant: 'Sushi House',
      date: '23 Apr 2026',
      status: 'pending',
      expires_at: '2026-04-30T23:59:59Z',
      created_at: '2026-04-25T17:00:00Z'
    });
    setLoading(false);
  }, [requestId, requestFromProps]);

  const handlePayNow = () => {
    if (onPay && request) {
      onPay(request);
    }
  };

  const handleDecline = () => {
    if (onDecline && request) {
      onDecline(request);
    }
  };

  if (loading) {
    return (
      <div className="splitter-screen">
        <div className="splitter-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <h1>Payment Request</h1>
          <div style={{ width: '24px' }}></div>
        </div>
        <div className="splitter-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="splitter-screen">
        <div className="splitter-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <h1>Payment Request</h1>
          <div style={{ width: '24px' }}></div>
        </div>
        <div className="splitter-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="splitter-screen">
      <div className="splitter-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>Payment Request</h1>
        <div style={{ width: '24px' }}></div>
      </div>

      <div className="splitter-content payment-request-content">
        {/* Sender Info */}
        <div className="payment-request-sender">
          <div className="sender-avatar">{request.from_user.avatar}</div>
          <div className="sender-info">
            <h2>{request.from_user.name}</h2>
            <p>requested payment</p>
          </div>
        </div>

        {/* Amount Card */}
        <div className="payment-amount-card">
          <div className="amount-label">Amount</div>
          <div className="amount-value">RM {request.amount.toFixed(2)}</div>
        </div>

        {/* Request Details */}
        <div className="payment-request-details">
          <div className="detail-row">
            <FileText size={20} className="detail-icon" />
            <div className="detail-content">
              <div className="detail-label">Restaurant</div>
              <div className="detail-value">{request.restaurant}</div>
            </div>
          </div>

          <div className="detail-row">
            <Calendar size={20} className="detail-icon" />
            <div className="detail-content">
              <div className="detail-label">Date</div>
              <div className="detail-value">{request.date}</div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="payment-request-items">
          <h3>Your Items:</h3>
          {request.items.map((item, index) => (
            <div key={index} className="item-row">
              <span className="item-name">• {item.name}</span>
              <span className="item-price">RM {item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="payment-request-actions">
          <button className="pay-now-button" onClick={handlePayNow}>
            <CreditCard size={20} />
            Pay Now
          </button>
          
          <button className="decline-button" onClick={handleDecline}>
            Decline
          </button>
        </div>

        {/* Expiry Notice */}
        <div className="expiry-notice">
          <p>This request expires on 30 Apr 2026</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestScreen;

// Made with Bob
