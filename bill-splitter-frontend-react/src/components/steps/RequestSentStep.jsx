import { useState, useEffect } from 'react'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import BannerNotification from '../BannerNotification'
import { webhookService } from '../../services/webhookService'

function RequestSentStep({ confirmedData, onNext, onBack }) {
  const splitResult = confirmedData || []
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
  
  const formattedTime = currentDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  // Banner notification state
  const [notifications, setNotifications] = useState([])
  const [currentNotification, setCurrentNotification] = useState(null)

  useEffect(() => {
    // Create notifications for each person
    const notifs = splitResult.map((person, index) => ({
      id: `notif_${index}`,
      title: 'Payment Request',
      body: `You requested RM ${(person.price || 0).toFixed(2)} from ${person.contact?.name || person.person} for ${person.item}`,
      recipient: person.contact?.name || person.person,
      amount: person.price || 0,
      item: person.item,
      restaurant: 'Restaurant', // You can pass this from props if available
      from: 'You'
    }))
    
    setNotifications(notifs)
    
    // Show notifications sequentially with delay AND send webhooks
    if (notifs.length > 0) {
      showNotificationsSequentially(notifs, 0)
    }
  }, [])

  const showNotificationsSequentially = async (notifs, index) => {
    if (index >= notifs.length) return
    
    const notif = notifs[index]
    setCurrentNotification(notif)

    const requestId = `req_${Date.now()}_${index}`
    const transactionId = `tx_${Date.now()}_${index}`
    
    // 🚀 SEND WEBHOOK to recipient UI
    webhookService.sendPaymentRequest({
      request_id: requestId,
      transaction_id: transactionId,
      from: 'Nitya',
      to: notif.recipient,
      amount: notif.amount,
      item: notif.item,
      restaurant: notif.restaurant || 'Restaurant',
      timestamp: new Date().toISOString()
    })
    
    // Show next notification after 6 seconds (5s display + 1s gap)
    setTimeout(() => {
      setCurrentNotification(null)
      setTimeout(() => {
        showNotificationsSequentially(notifs, index + 1)
      }, 1000)
    }, 6000)
  }

  const handleNotificationClose = () => {
    setCurrentNotification(null)
  }

  const handleNotificationTap = (notification) => {
    console.log('Notification tapped:', notification)
    // Could navigate to a specific screen or show details
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Banner Notification */}
      {currentNotification && (
        <BannerNotification
          notification={currentNotification}
          onClose={handleNotificationClose}
          onTap={handleNotificationTap}
          autoHideDuration={5000}
        />
      )}
      {/* Header - TNG Blue */}
      <div style={{
        background: 'linear-gradient(135deg, #1e5ba8 0%, #2d6bb5 100%)',
        padding: '15px 20px',
        paddingTop: '50px',
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <ArrowLeft 
            size={24} 
            style={{ cursor: 'pointer' }}
            onClick={onBack}
          />
          <h1 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            flex: 1,
            textAlign: 'center'
          }}>
            History
          </h1>
          <SlidersHorizontal size={24} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Date Range Filter */}
      <div style={{
        background: 'white',
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '15px',
          color: '#333',
          fontWeight: '500'
        }}>
          {formattedDate}
        </div>
        <button style={{
          background: 'transparent',
          border: '1px solid #1e5ba8',
          color: '#1e5ba8',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Send to email
        </button>
      </div>

      {/* Date Section Header */}
      <div style={{
        background: '#f5f5f5',
        padding: '12px 20px',
        fontSize: '13px',
        color: '#999',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
      </div>

      {/* Transaction List */}
      <div style={{ background: 'white' }}>
        {splitResult.map((person, index) => (
          <div 
            key={index}
            style={{
              padding: '16px 20px',
              borderBottom: index < splitResult.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginBottom: '6px' 
                }}>
                  {formattedDate}, {formattedTime}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '4px',
                  color: '#000'
                }}>
                  Request to {person.contact?.name || person.person}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666'
                }}>
                  {person.item}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#000',
                  marginBottom: '4px'
                }}>
                  -RM{(person.price || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div style={{ padding: '20px' }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #1e5ba8 0%, #2d6bb5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(30,91,168,0.3)'
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default RequestSentStep

// Made with Bob
