import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, Calendar, Clock, User, DollarSign, Share2 } from 'lucide-react';

const PaymentSuccessScreen = ({ transaction, onDone, onViewReceipt }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti animation after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-MY', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-MY', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const handleShare = () => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Payment Receipt',
        text: `Payment of RM ${transaction.amount.toFixed(2)} to ${transaction.to}`,
        url: window.location.href
      }).catch(err => console.log('Share failed:', err));
    } else {
      alert('Receipt details copied to clipboard!');
    }
  };

  return (
    <div className="splitter-screen payment-success-screen">
      {showConfetti && <div className="confetti-animation"></div>}
      
      <div className="splitter-content payment-success-content">
        {/* Success Icon */}
        <div className="success-icon-container">
          <div className="success-icon-circle">
            <CheckCircle size={64} className="success-icon" />
          </div>
        </div>

        {/* Success Message */}
        <div className="success-message">
          <h1>Payment Successful!</h1>
          <p>RM {transaction.amount.toFixed(2)} paid to {transaction.to}</p>
        </div>

        {/* Receipt Card */}
        <div className="receipt-card">
          <div className="receipt-header">
            <FileText size={20} />
            <span>Transaction Receipt</span>
          </div>

          <div className="receipt-details">
            <div className="receipt-row">
              <span className="receipt-label">Receipt ID:</span>
              <span className="receipt-value">{transaction.transaction_id}</span>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-row">
              <Calendar size={16} className="receipt-icon" />
              <span className="receipt-label">Date:</span>
              <span className="receipt-value">{formatDate(transaction.timestamp)}</span>
            </div>

            <div className="receipt-row">
              <Clock size={16} className="receipt-icon" />
              <span className="receipt-label">Time:</span>
              <span className="receipt-value">{formatTime(transaction.timestamp)}</span>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-row">
              <User size={16} className="receipt-icon" />
              <span className="receipt-label">From:</span>
              <span className="receipt-value">{transaction.from}</span>
            </div>

            <div className="receipt-row">
              <User size={16} className="receipt-icon" />
              <span className="receipt-label">To:</span>
              <span className="receipt-value">{transaction.to}</span>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-row highlight">
              <DollarSign size={16} className="receipt-icon" />
              <span className="receipt-label">Amount:</span>
              <span className="receipt-value amount">RM {transaction.amount.toFixed(2)}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Payment Method:</span>
              <span className="receipt-value">
                {transaction.payment_method === 'ewallet' ? 'TNG eWallet' : 'Bank Transfer'}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Status:</span>
              <span className="receipt-value status-completed">
                <CheckCircle size={14} />
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <button className="share-button" onClick={handleShare}>
            <Share2 size={20} />
            Share Receipt
          </button>

          <button className="view-receipt-button" onClick={onViewReceipt}>
            <FileText size={20} />
            View Receipt
          </button>

          <button className="done-button" onClick={onDone}>
            Done
          </button>
        </div>

        {/* Footer Note */}
        <div className="success-footer">
          <p>✓ Payment has been sent to {transaction.to}</p>
          <p className="footer-note">A notification has been sent to confirm the payment</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessScreen;

