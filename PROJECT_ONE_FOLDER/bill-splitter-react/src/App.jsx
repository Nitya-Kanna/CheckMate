import { useEffect, useMemo, useState } from 'react'
import { Home, Wallet, History, User, Signal, Wifi, Battery } from 'lucide-react'
import './App.css'
import HomeScreen from './components/HomeScreen'
import ReceiptsListScreen from './components/ReceiptsListScreen'
import HistoryScreen from './components/HistoryScreen'
import BillSplitter from './components/BillSplitter'
import PaymentRequestScreen from './components/PaymentRequestScreen'
import PaymentConfirmScreen from './components/PaymentConfirmScreen'
import PaymentSuccessScreen from './components/PaymentSuccessScreen'
import { webhookService } from './services/webhookService'
import BannerNotification from './components/BannerNotification'

function App() {
  const mode = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') === 'payer' ? 'payer' : 'requester'
  }, [])

  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [transaction, setTransaction] = useState(null)
  const [bannerNotification, setBannerNotification] = useState(null)

  const mapIncomingWebhookRequest = (request) => ({
    request_id: request.request_id,
    transaction_id: request.transaction_id,
    from_user: {
      user_id: 'user_123',
      name: request.from || 'Friend',
      phone: '+60123456789',
      avatar: '👤'
    },
    to_user: {
      user_id: 'user_456',
      name: request.to || 'You',
      phone: '+60198765432'
    },
    amount: Number(request.amount || 0),
    currency: 'MYR',
    description: `${request.restaurant || 'Restaurant'} - Payment Request`,
    items: [
      {
        name: request.item || 'Your Items',
        price: Number(request.amount || 0)
      }
    ],
    restaurant: request.restaurant || 'Restaurant',
    date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: request.status || 'pending'
  })

  const handleSelectReceipt = (receipt) => {
    setSelectedReceipt(receipt)
    setCurrentScreen('splitter')
  }

  const handleNotificationClick = (notification) => {
    setSelectedRequest({
      request_id: notification.request_id,
      from_user: {
        user_id: 'user_123',
        name: notification.from,
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
      description: `${notification.restaurant} - Payment Request`,
      items: [
        {
          name: 'Your Items',
          price: notification.amount
        }
      ],
      restaurant: notification.restaurant,
      date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'pending'
    })
    setCurrentScreen('payment-request')
  }

  useEffect(() => {
    if (mode !== 'payer') return

    const unsubscribe = webhookService.onPaymentRequest((request) => {
      const mappedRequest = mapIncomingWebhookRequest(request)

      setBannerNotification({
        title: 'Payment Request',
        body: `${mappedRequest.from_user.name} requested RM ${mappedRequest.amount.toFixed(2)} for ${mappedRequest.items[0].name}`
      })

      setSelectedRequest(mappedRequest)

      // Mimic app behavior: show banner first, then open payment request screen.
      setTimeout(() => {
        setCurrentScreen('payment-request')
      }, 1200)
    })

    return unsubscribe
  }, [mode])

  const handlePayRequest = (request) => {
    setSelectedRequest(request)
    setCurrentScreen('payment-confirm')
  }

  const handleConfirmPayment = (txn) => {
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
      <div className="app-container">
        {mode === 'payer' && bannerNotification && (
          <BannerNotification
            notification={bannerNotification}
            onClose={() => setBannerNotification(null)}
            onTap={() => {
              setBannerNotification(null)
              setCurrentScreen('payment-request')
            }}
            autoHideDuration={5000}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={() => setCurrentScreen('receipts')}
            appMode={mode}
            onNotificationClick={handleNotificationClick}
          />
        )}
        {currentScreen === 'receipts' && (
          <ReceiptsListScreen
            onBack={() => setCurrentScreen('home')}
            onSelectReceipt={handleSelectReceipt}
          />
        )}
        {currentScreen === 'history' && (
          <HistoryScreen onBack={() => setCurrentScreen('home')} />
        )}
        {currentScreen === 'splitter' && mode !== 'payer' && (
          <BillSplitter
            selectedReceipt={selectedReceipt}
            onBack={() => setCurrentScreen('receipts')}
          />
        )}
        {currentScreen === 'payment-request' && selectedRequest && (
          <PaymentRequestScreen
            requestId={selectedRequest.request_id}
            request={selectedRequest}
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
            onViewReceipt={() => setCurrentScreen('history')}
          />
        )}
      </div>
      {/* Notification Screen Overlay - Hidden by default, only shown via handleNotificationClick */}
      {false && (
        <NotificationScreen
          onNotificationClick={handleNotificationClick}
          onClose={() => {}}
        />
      )}

      <div className="bottom-nav">
        <div className={`nav-item ${currentScreen === 'home' ? 'active' : ''}`} onClick={() => setCurrentScreen('home')}>
          <div className="nav-icon"><Home size={24} /></div>
          <div>Home</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon"><Wallet size={24} /></div>
          <div>Wallet</div>
        </div>
        <div className={`nav-item ${currentScreen === 'history' ? 'active' : ''}`} onClick={() => setCurrentScreen('history')}>
          <div className="nav-icon"><History size={24} /></div>
          <div>History</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon"><User size={24} /></div>
          <div>{mode === 'payer' ? 'Payer' : 'Profile'}</div>
        </div>
      </div>
    </div>
  )
}

export default App

// Made with Bob
