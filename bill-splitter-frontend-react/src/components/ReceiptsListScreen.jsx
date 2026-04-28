import { useState, useEffect } from 'react'
import { ArrowLeft, Receipt, ChevronRight, Calendar, DollarSign, Plus, Upload } from 'lucide-react'
import { getReceipts } from '../services/api'
import UploadModal from './modals/UploadModal'

const LOCAL_UPLOADED_RECEIPTS_KEY = 'uploaded_receipts_local_v1'

function ReceiptsListScreen({ onBack, onSelectReceipt }) {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, ready_to_split, completed
  const [showUploadModal, setShowUploadModal] = useState(false)

  const normalizeReceipt = (receipt) => {
    const items = Array.isArray(receipt?.items) ? receipt.items : []
    const total = Number(receipt?.total || 0)
    return {
      receipt_id: receipt?.receipt_id || `rcpt_${Date.now()}`,
      restaurant_name: receipt?.restaurant_name || 'Scanned Receipt',
      subtotal: Number(receipt?.subtotal || total),
      tax: Number(receipt?.tax || 0),
      service: Number(receipt?.service || 0),
      total,
      date: receipt?.date || new Date().toISOString().split('T')[0],
      time:
        receipt?.time ||
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: receipt?.status || 'ready_to_split',
      items,
      items_count: Number(receipt?.items_count ?? items.length)
    }
  }

  const readLocalUploadedReceipts = () => {
    try {
      const raw = localStorage.getItem(LOCAL_UPLOADED_RECEIPTS_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.map(normalizeReceipt)
    } catch {
      return []
    }
  }

  const writeLocalUploadedReceipts = (list) => {
    try {
      localStorage.setItem(LOCAL_UPLOADED_RECEIPTS_KEY, JSON.stringify(list))
    } catch {
      // Ignore storage write errors.
    }
  }

  const applyFilter = (list, activeFilter) => {
    if (activeFilter === 'all') return list
    return list.filter((receipt) => receipt.status === activeFilter)
  }

  const mergeReceipts = (apiReceipts, uploadedReceipts) => {
    const seen = new Set()
    const merged = []
    ;[...uploadedReceipts, ...apiReceipts].forEach((receipt) => {
      const normalized = normalizeReceipt(receipt)
      if (seen.has(normalized.receipt_id)) return
      seen.add(normalized.receipt_id)
      merged.push(normalized)
    })
    return merged
  }

  useEffect(() => {
    fetchReceipts()
  }, [filter])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const response = await getReceipts('user_123', 20, 0, filter === 'all' ? undefined : filter)
      const localUploaded = readLocalUploadedReceipts()
      
      if (response.success) {
        const merged = mergeReceipts(response.receipts || [], localUploaded)
        setReceipts(applyFilter(merged, filter))
      } else {
        setReceipts(applyFilter(localUploaded, filter))
        if (localUploaded.length === 0) {
          setError('Failed to load receipts')
        }
      }
    } catch (err) {
      console.error('Error fetching receipts:', err)
      const localUploaded = readLocalUploadedReceipts()
      setReceipts(applyFilter(localUploaded, filter))
      if (localUploaded.length === 0) {
        setError('Failed to load receipts')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
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

  const getStatusBadge = (status) => {
    if (status === 'ready_to_split') {
      return <span className="status-badge ready">Ready to Split</span>
    } else if (status === 'completed') {
      return <span className="status-badge completed">Completed</span>
    }
    return null
  }

  if (loading) {
    return (
      <>
        <div className="splitter-header">
          <div className="back-btn" onClick={onBack}><ArrowLeft size={24} /></div>
          <div className="header-title">My Receipts</div>
        </div>
        <div className="splitter-content">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Loading Receipts...</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Fetching your receipts</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="splitter-header">
          <div className="back-btn" onClick={onBack}><ArrowLeft size={24} /></div>
          <div className="header-title">My Receipts</div>
        </div>
        <div className="splitter-content">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>❌</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Error Loading Receipts</div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>{error}</div>
            <button className="primary-btn" onClick={fetchReceipts}>Retry</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="splitter-header">
        <div className="back-btn" onClick={onBack}><ArrowLeft size={24} /></div>
        <div className="header-title">My Receipts</div>
      </div>

      <div className="splitter-content">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({receipts.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'ready_to_split' ? 'active' : ''}`}
            onClick={() => setFilter('ready_to_split')}
          >
            Ready to Split
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {/* Receipts List */}
        {receipts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
            <Receipt size={48} color="#ccc" style={{ marginBottom: '15px' }} />
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Receipts Found</div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {filter === 'all' ? 'You don\'t have any receipts yet' : `No ${filter.replace('_', ' ')} receipts`}
            </div>
          </div>
        ) : (
          <div className="receipts-list">
            {receipts.map((receipt) => (
              <div
                key={receipt.receipt_id}
                className="receipt-card"
                onClick={() => onSelectReceipt(receipt)}
              >
                <div className="receipt-icon">
                  <Receipt size={24} color="#0066CC" />
                </div>
                <div className="receipt-details">
                  <div className="receipt-header">
                    <div className="receipt-name">{receipt.restaurant_name}</div>
                    <div className="receipt-amount">RM {receipt.total.toFixed(2)}</div>
                  </div>
                  <div className="receipt-meta">
                    <span>{formatDate(receipt.date)}</span>
                    <span className="meta-separator">•</span>
                    <span>{receipt.time}</span>
                    <span className="meta-separator">•</span>
                    <span>{Math.floor(receipt.items_count)} items</span>
                  </div>
                  <div className="receipt-footer">
                    {getStatusBadge(receipt.status)}
                  </div>
                </div>
                <div className="receipt-chevron">
                  <ChevronRight size={20} color="#999" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          className="fab-button"
          onClick={() => {
            console.log('FAB clicked!')
            setShowUploadModal(true)
          }}
          aria-label="Upload Receipt"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={(newReceipt) => {
            setShowUploadModal(false)
            const normalized = normalizeReceipt(newReceipt)
            const existing = readLocalUploadedReceipts()
            const updatedLocal = [normalized, ...existing.filter((r) => r.receipt_id !== normalized.receipt_id)]
            writeLocalUploadedReceipts(updatedLocal)
            fetchReceipts() // Refresh list with local + API data.
          }}
        />
      )}
    </>
  )
}

export default ReceiptsListScreen

