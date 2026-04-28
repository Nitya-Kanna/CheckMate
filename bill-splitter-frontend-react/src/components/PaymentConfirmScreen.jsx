import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Building2, Check } from 'lucide-react';
import { webhookService } from '../services/webhookService';

const PaymentConfirmScreen = ({ request, onBack, onConfirm, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState('ewallet');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'ewallet',
      name: 'TNG eWallet',
      icon: <Wallet size={24} />,
      balance: 'Balance: RM 1,234.56',
      available: true
    },
    {
      id: 'bank',
      name: 'Maybank ****1234',
      icon: <Building2 size={24} />,
      balance: '',
      available: true
    }
  ];

  const handlePinChange = (value) => {
    // Only allow numbers and max 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
      setPinError('');
    }
  };

  const handleConfirmPayment = async () => {
    // Validate PIN
    if (pin.length !== 6) {
      setPinError('Please enter a 6-digit PIN');
      return;
    }

    setProcessing(true);
    setPinError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful payment
      const transaction = {
        transaction_id: `TXN${Date.now()}`,
        amount: request.amount,
        status: 'completed',
        timestamp: new Date().toISOString(),
        payment_method: selectedMethod,
        from: request.to_user.name,
        to: request.from_user.name
      };

      webhookService.sendPaymentConfirmation({
        request_id: request.request_id,
        status: 'paid',
        amount: request.amount,
        from: request.to_user?.name || 'Payer',
        to: request.from_user?.name || 'Requester',
        timestamp: new Date().toISOString()
      })

      if (onConfirm) {
        onConfirm(transaction);
      }
    } catch (error) {
      setPinError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && pin.length === 6) {
      handleConfirmPayment();
    }
  };

  return (
    <div className="splitter-screen">
      <div className="splitter-header">
        <button className="back-button" onClick={onBack} disabled={processing}>
          <ArrowLeft size={24} />
        </button>
        <h1>Confirm Payment</h1>
        <div style={{ width: '24px' }}></div>
      </div>

      <div className="splitter-content payment-confirm-content">
        {/* Payment Summary */}
        <div className="payment-summary">
          <div className="summary-row">
            <span className="summary-label">Pay to:</span>
            <span className="summary-value">{request.from_user.name}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Amount:</span>
            <span className="summary-value amount">RM {request.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-method-section">
          <h3>Payment Method:</h3>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.available || processing}
              >
                <div className="method-icon">{method.icon}</div>
                <div className="method-info">
                  <div className="method-name">{method.name}</div>
                  {method.balance && <div className="method-balance">{method.balance}</div>}
                </div>
                {selectedMethod === method.id && (
                  <div className="method-check">
                    <Check size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* PIN Entry */}
        <div className="pin-entry-section">
          <h3>Enter PIN:</h3>
          <div className="pin-input-container">
            <input
              type="password"
              className={`pin-input ${pinError ? 'error' : ''}`}
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••"
              maxLength={6}
              disabled={processing}
              autoFocus
            />
            {pinError && <div className="pin-error">{pinError}</div>}
          </div>
          <div className="pin-hint">Enter your 6-digit PIN to confirm</div>
        </div>

        {/* Confirm Button */}
        <div className="payment-confirm-actions">
          <button
            className="confirm-payment-button"
            onClick={handleConfirmPayment}
            disabled={pin.length !== 6 || processing}
          >
            {processing ? (
              <>
                <div className="button-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Confirm Payment
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <p>🔒 Your payment is secured with 256-bit encryption</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmScreen;

// Made with Bob
