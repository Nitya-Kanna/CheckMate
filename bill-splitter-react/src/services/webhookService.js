// Webhook Service using BroadcastChannel for cross-port communication
// BroadcastChannel works across different ports on the same origin

const CHANNEL_NAME = 'tng_payment_webhook';

// Persistent channel - stays open for listening
let channel = null;
const getChannel = () => {
  if (!channel && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
};

export const webhookService = {
  // Sender: Send payment request notification
  sendPaymentRequest: (paymentRequest) => {
    const webhook = {
      type: 'payment_request',
      timestamp: Date.now(),
      data: paymentRequest
    };
    
    console.log('📤 Sending payment request webhook:', webhook);
    
    const ch = getChannel();
    if (ch) {
      ch.postMessage(webhook);
      console.log('✅ Webhook sent via BroadcastChannel');
    }
  },

  // Recipient: Listen for payment request notifications
  onPaymentRequest: (callback) => {
    console.log('🎧 Listening for payment requests...');
    
    const ch = getChannel();
    
    if (ch) {
      const handleMessage = (event) => {
        const webhook = event.data;
        if (webhook.type === 'payment_request') {
          console.log('📥 Payment request received:', webhook);
          callback(webhook.data);
        }
      };
      
      ch.addEventListener('message', handleMessage);
      
      return () => {
        ch.removeEventListener('message', handleMessage);
      };
    }
    
    // Fallback: no channel available
    console.warn('⚠️ BroadcastChannel not available');
    return () => {};
  },

  // Send payment confirmation (recipient to sender)
  sendPaymentConfirmation: (confirmation) => {
    const webhook = {
      type: 'payment_confirmation',
      timestamp: Date.now(),
      data: confirmation
    };
    
    console.log('📤 Sending payment confirmation:', webhook);
    
    const ch = getChannel();
    if (ch) {
      ch.postMessage(webhook);
    }
  },

  // Listen for payment confirmations
  onPaymentConfirmation: (callback) => {
    const ch = getChannel();
    
    if (ch) {
      const handleMessage = (event) => {
        const webhook = event.data;
        if (webhook.type === 'payment_confirmation') {
          console.log('📥 Payment confirmation received:', webhook);
          callback(webhook.data);
        }
      };
      
      ch.addEventListener('message', handleMessage);
      
      return () => {
        ch.removeEventListener('message', handleMessage);
      };
    }
    
    return () => {};
  },

  // Integration trace events for demo observability
  sendIntegrationTrace: (trace) => {
    const webhook = {
      type: 'integration_trace',
      timestamp: Date.now(),
      data: trace
    };

    const ch = getChannel();
    if (ch) {
      ch.postMessage(webhook);
    }
  },

  onIntegrationTrace: (callback) => {
    const ch = getChannel();
    if (ch) {
      const handleMessage = (event) => {
        const webhook = event.data;
        if (webhook.type === 'integration_trace') {
          callback(webhook.data);
        }
      };

      ch.addEventListener('message', handleMessage);
      return () => {
        ch.removeEventListener('message', handleMessage);
      };
    }

    return () => {};
  }
};
