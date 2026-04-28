import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

function HistoryScreen({ onBack }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://tstxkw26v5.execute-api.ap-southeast-1.amazonaws.com/prod/history?user_id=user_001')
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment_sent':
        return <ArrowUpRight size={20} color="#FF6B6B" />
      case 'payment_received':
        return <ArrowDownLeft size={20} color="#51CF66" />
      case 'bill_split':
        return <Clock size={20} color="#0066CC" />
      default:
        return <Clock size={20} color="#999" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'payment_sent':
        return '#FF6B6B'
      case 'payment_received':
        return '#51CF66'
      default:
        return '#333'
    }
  }

  const formatAmount = (amount, type) => {
    const prefix = type === 'payment_sent' ? '-' : '+'
    return `${prefix}RM ${amount.toFixed(2)}`
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-MY', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    if (filter === 'sent') return tx.type === 'payment_sent'
    if (filter === 'received') return tx.type === 'payment_received'
    return true
  })

  return (
    <>
      {/* Header */}
      <div className="history-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="history-title">Transaction History</h1>
        <button className="filter-btn">
          <Filter size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="history-search-container">
        <div className="history-search-bar">
          <Search size={18} color="#999" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="history-search-input"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="history-filter-tabs">
        <button 
          className={`history-filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`history-filter-tab ${filter === 'sent' ? 'active' : ''}`}
          onClick={() => setFilter('sent')}
        >
          Sent
        </button>
        <button 
          className={`history-filter-tab ${filter === 'received' ? 'active' : ''}`}
          onClick={() => setFilter('received')}
        >
          Received
        </button>
      </div>

      {/* Transactions List */}
      <div className="history-content">
        {loading ? (
          <div className="history-loading">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="history-empty">
            <Clock size={48} color="#ccc" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredTransactions.map((tx) => (
              <div key={tx.transaction_id} className="history-item">
                <div className="history-item-icon">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="history-item-details">
                  <div className="history-item-title">{tx.description}</div>
                  <div className="history-item-meta">
                    {formatDate(tx.timestamp)} • {formatTime(tx.timestamp)}
                  </div>
                  {tx.status && (
                    <div className={`history-item-status ${tx.status}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </div>
                  )}
                </div>
                <div 
                  className="history-item-amount"
                  style={{ color: getTransactionColor(tx.type) }}
                >
                  {formatAmount(tx.amount, tx.type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default HistoryScreen

// Made with Bob