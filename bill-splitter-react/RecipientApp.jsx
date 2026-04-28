import { useState, useEffect } from 'react'
import { Signal, Wifi, Battery, Home, Wallet, History, User, Bell, Eye, EyeOff, ChevronRight, Plus, Search, FileText, PieChart, Send, CreditCard, ShoppingBag, Scissors } from 'lucide-react'
import './src/App.css'
import PaymentRequestScreen from './src/components/PaymentRequestScreen'
import PaymentConfirmScreen from './src/components/PaymentConfirmScreen'
import PaymentSuccessScreen from './src/components/PaymentSuccessScreen'
import NotificationScreen from './src/components/NotificationScreen'
import BannerNotification from './src/components/BannerNotification'
import { webhookService } from './src/services/webhookService'

function RecipientApp() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [transaction, setTransaction] = useState(null)
  const [incomingNotification, setIncomingNotification] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [balanceVisible, setBalanceVisible] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen for incoming payment requests via BroadcastChannel
  useEffect(() => {
    console.log('🎧 Payer UI listening for webhooks on port 5174...')
    
    const cleanup = webhookService.onPaymentRequest((paymentRequest) => {
      console.log('🔔 Payer received payment request:', paymentRequest)
      
      // Show banner notification (iOS push notification style)
      const notification = {
        id: paymentRequest.request_id || `notif_${Date.now()}`,
        title: 'Payment Request',
        body: `${paymentRequest.from} requested RM ${(paymentRequest.amount || 0).toFixed(2)} for ${paymentRequest.item || 'bill split'}`,
        from: paymentRequest.from,
        amount: paymentRequest.amount,
        restaurant: paymentRequest.restaurant,
        item: paymentRequest.item,
        request_id: paymentRequest.request_id,
        timestamp: new Date().toISOString()
      }
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show banner
      setIncomingNotification(notification)
      
      // Auto-hide banner after 5 seconds
      setTimeout(() => {
        setIncomingNotification(null)
      }, 5000)
    })

    return cleanup
  }, [])

  const handleBannerTap = (notification) => {
    console.log('Banner tapped:', notification)
    setIncomingNotification(null)
    // Navigate to the payment request
    handleNotificationClick(notification)
  }

  const handleBannerClose = () => {
    setIncomingNotification(null)
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    setSelectedRequest({
      request_id: notification.request_id || notification.id,
      from_user: {
        user_id: 'user_123',
        name: notification.from || 'Friend',
        phone: '+60123456789',
        avatar: '👤'
      },
      to_user: {
        user_id: 'user_456',
        name: 'You',
        phone: '+60198765432'
      },
      amount: notification.amount,
      currency: 'MYR',
      description: `${notification.restaurant || 'Restaurant'} - Payment Request`,
      items: [
        {
          name: notification.item || 'Your Items',
          price: notification.amount
        }
      ],
      restaurant: notification.restaurant || 'Restaurant',
      date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'pending'
    })
    setCurrentScreen('payment-request')
  }

  const handlePayRequest = (request) => {
    setSelectedRequest(request)
    setCurrentScreen('payment-confirm')
  }

  const handleConfirmPayment = (txn) => {
    // Send payment confirmation back to sender
    webhookService.sendPaymentConfirmation({
      transaction_id: txn.transaction_id,
      amount: txn.amount,
      from: 'You',
      to: txn.to,
      status: 'completed'
    })
    setTransaction(txn)
    setCurrentScreen('payment-success')
  }

  const handleDeclineRequest = () => {
    setCurrentScreen('home')
    setSelectedRequest(null)
  }

  const handlePaymentDone = () => {
    setCurrentScreen('home')
    setSelectedRequest(null)
    setTransaction(null)
  }

  return (
    <div className="phone-frame">
      <div className="notch"></div>
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Signal size={14} />
          <Wifi size={14} />
          <Battery size={14} />
        </span>
      </div>
      
      {/* Real-time Banner Notification (iOS push style) */}
      {incomingNotification && (
        <BannerNotification
          notification={incomingNotification}
          onClose={handleBannerClose}
          onTap={handleBannerTap}
          autoHideDuration={5000}
        />
      )}
      
      <div className="app-container">
        {currentScreen === 'home' && (
          <PayerHomeScreen 
            onNotifications={() => setCurrentScreen('notifications')}
            unreadCount={unreadCount}
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
          />
        )}
        {currentScreen === 'notifications' && (
          <NotificationScreen
            onNotificationClick={handleNotificationClick}
            onClose={() => setCurrentScreen('home')}
          />
        )}
        {currentScreen === 'payment-request' && selectedRequest && (
          <PaymentRequestScreen
            requestId={selectedRequest.request_id}
            onBack={() => setCurrentScreen('home')}
            onPay={handlePayRequest}
            onDecline={handleDeclineRequest}
          />
        )}
        {currentScreen === 'payment-confirm' && selectedRequest && (
          <PaymentConfirmScreen
            request={selectedRequest}
            onBack={() => setCurrentScreen('payment-request')}
            onConfirm={handleConfirmPayment}
            onCancel={() => setCurrentScreen('payment-request')}
          />
        )}
        {currentScreen === 'payment-success' && transaction && (
          <PaymentSuccessScreen
            transaction={transaction}
            onDone={handlePaymentDone}
            onViewReceipt={() => setCurrentScreen('home')}
          />
        )}
      </div>

      {/* Notification Bell */}
      {currentScreen === 'home' && (
        <div
          className="notification-bell-icon"
          onClick={() => setCurrentScreen('notifications')}
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            zIndex: 999,
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'relative' }}>
            <Bell size={24} color="#0066CC" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff3b30',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '16px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <div className={`nav-item ${currentScreen === 'home' ? 'active' : ''}`} onClick={() => setCurrentScreen('home')}>
          <div className="nav-icon"><Home size={24} /></div>
          <div>Home</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon"><Wallet size={24} /></div>
          <div>Wallet</div>
        </div>
        <div className="nav-item" onClick={() => setCurrentScreen('notifications')}>
          <div className="nav-icon" style={{ position: 'relative' }}>
            <History size={24} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ff3b30',
                color: 'white',
                fontSize: '8px',
                fontWeight: '600',
                padding: '1px 4px',
                borderRadius: '8px',
                minWidth: '12px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div>Activity</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon"><User size={24} /></div>
          <div>Profile</div>
        </div>
      </div>
    </div>
  )
}

// Payer's Home Screen - simpler than sender, focuses on paying
function PayerHomeScreen({ onNotifications, unreadCount, balanceVisible, setBalanceVisible }) {
  return (
    <>
      {/* Top Bar */}
      <div className="tng-top-bar">
        <div className="country-selector">
          <span className="flag">🇲🇾</span>
          <span>MY</span>
          <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
        </div>
        <div className="search-bar-top">
          <Search size={18} color="#999" />
          <input type="text" placeholder="Search..." />
        </div>
        <div className="profile-icons">
          <div className="notification-dot" onClick={onNotifications} style={{ cursor: 'pointer' }}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="dot red"></span>}
          </div>
          <div className="profile-avatar">
            <span className="dot yellow"></span>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="balance-section">
        <div className="balance-display">
          <div className="balance-icon">
            <div className="shield-icon">✓</div>
          </div>
          <div className="balance-text">
            <span className="balance-amount-large">
              {balanceVisible ? 'RM 1,234.56' : 'RM ****'}
            </span>
            <button 
              className="eye-toggle"
              onClick={() => setBalanceVisible(!balanceVisible)}
            >
              {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>
        
        <button className="view-assets">
          View asset details <ChevronRight size={16} />
        </button>

        <div className="balance-buttons">
          <button className="add-money-btn">
            <Plus size={18} />
            Add money
          </button>
          <button className="transactions-btn">
            Transactions <ChevronRight size={16} />
          </button>
        </div>

        {/* Action Icons */}
        <div className="action-icons-row">
          <div className="action-icon-item">
            <div className="action-icon-circle">
              <FileText size={24} color="#0066CC" />
            </div>
            <span>Apply</span>
          </div>
          <div className="action-icon-item">
            <div className="action-icon-circle">
              <PieChart size={24} color="#0066CC" />
            </div>
            <span>Cash flow</span>
          </div>
          <div className="action-icon-item">
            <div className="action-icon-circle">
              <Send size={24} color="#0066CC" />
            </div>
            <span>Transfer</span>
          </div>
          <div className="action-icon-item">
            <div className="action-icon-circle">
              <CreditCard size={24} color="#0066CC" />
            </div>
            <span>Cards</span>
          </div>
        </div>
      </div>

      {/* Pending Payment Requests Banner */}
      {unreadCount > 0 && (
        <div style={{
          margin: '0 16px 12px',
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          border: '1px solid #FFB74D'
        }} onClick={onNotifications}>
          <div style={{
            background: '#FF9800',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Bell size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#E65100' }}>
              {unreadCount} Payment Request{unreadCount > 1 ? 's' : ''} Pending
            </div>
            <div style={{ fontSize: '12px', color: '#BF360C' }}>Tap to review and pay</div>
          </div>
          <ChevronRight size={20} color="#E65100" />
        </div>
      )}

      {/* Apps Grid */}
      <div className="apps-section">
        <div className="apps-header">Services</div>
        <div className="apps-grid">
          <div className="app-item">
            <div className="app-icon">
              <FileText size={28} color="#0066CC" />
            </div>
            <span>Bills</span>
          </div>
          <div className="app-item">
            <div className="app-icon">
              <ShoppingBag size={28} color="#0066CC" />
            </div>
            <span>eStore</span>
          </div>
          <div className="app-item">
            <div className="app-icon" style={{ background: '#FFF3E0', border: '2px solid #FF9800' }}>
              <Scissors size={28} color="#FF9800" />
            </div>
            <span style={{ color: '#FF9800', fontWeight: '600' }}>Bill Pay</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default RecipientApp
