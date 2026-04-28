import { useState } from 'react'
import { Eye, EyeOff, Plus, ChevronRight, Search, Bell, FileText, PieChart, Send, CreditCard, Gift, MapPin, ShoppingBag, Calendar, Plane, Scissors, Lightbulb, Smartphone, Film, Zap, Car, Fuel, AlertCircle } from 'lucide-react'

function HomeScreen({ onNavigate, appMode = 'requester' }) {
  const [balanceVisible, setBalanceVisible] = useState(false)

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
          <input type="text" placeholder="Street Parking 🚗" />
        </div>
        <div className="profile-icons">
          <div className="notification-dot">
            <Bell size={20} />
            <span className="dot red"></span>
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

      {/* Reminder Section */}
      <div className="reminder-section">
        <div className="reminder-header">
          <AlertCircle size={20} color="#FF9800" />
          <span>Reminder</span>
        </div>
        <div className="reminder-card">
          <div className="reminder-content">
            <div className="reminder-title">You have unsuccessful Netflix payments</div>
            <div className="reminder-subtitle">Update or cancel auto debit details</div>
          </div>
          <ChevronRight size={20} color="#999" />
        </div>
      </div>

      {/* Apps Grid Section */}
      <div className="apps-section">
        <div className="apps-header">Services</div>
        <div className="apps-grid">
          <div className="app-item">
            <div className="app-icon">
              <Lightbulb size={28} color="#0066CC" />
            </div>
            <span>Bills</span>
          </div>
          <div className="app-item">
            <div className="app-icon">
              <Smartphone size={28} color="#0066CC" />
            </div>
            <span>Prepaid</span>
          </div>
          <div className="app-item">
            <div className="app-icon">
              <ShoppingBag size={28} color="#0066CC" />
            </div>
            <span>eStore</span>
          </div>
          <div className="app-item">
            <div className="app-icon">
              <Car size={28} color="#0066CC" />
            </div>
            <span>Parking</span>
          </div>
          <div className="app-item">
            <div className="app-icon">
              <Gift size={28} color="#0066CC" />
            </div>
            <span>Rewards</span>
          </div>
          <div className="app-item" onClick={appMode === 'payer' ? undefined : onNavigate} style={{ opacity: appMode === 'payer' ? 0.5 : 1, cursor: appMode === 'payer' ? 'default' : 'pointer' }}>
            <div className="app-icon special">
              <Scissors size={28} color="white" />
              <span className="new-badge">NEW</span>
            </div>
            <span>Bill Split</span>
          </div>
        </div>
      </div>

      {appMode === 'payer' && (
        <div style={{
          margin: '0 16px 12px',
          background: '#E8F3FF',
          border: '1px solid #CDE2FF',
          color: '#1A5FB4',
          padding: '10px 12px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Payer mode active: waiting for incoming payment requests.
        </div>
      )}
    </>
  )
}

export default HomeScreen

// Made with Bob
