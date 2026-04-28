import { Check, Camera, Receipt as ReceiptIcon } from 'lucide-react'

function ReceiptStep({ receiptData, onNext, clickable }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <ReceiptIcon size={24} color="#666" />
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>Receipt Details</div>
      </div>
      
      <div
        className="receipt-display"
        onClick={clickable ? onNext : undefined}
        style={{
          cursor: clickable ? 'pointer' : 'default',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => clickable && (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => clickable && (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div className="receipt-header">
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{receiptData.restaurant_name}</div>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>{receiptData.date} | {receiptData.time}</div>
        </div>

        {receiptData.items.map((item, index) => (
          <div key={index} className="receipt-item">
            <span>{item.name}</span>
            <span>RM {item.price.toFixed(2)}</span>
          </div>
        ))}

        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ddd' }}>
          <div className="receipt-item">
            <span>Subtotal</span>
            <span>RM {receiptData.subtotal.toFixed(2)}</span>
          </div>
          <div className="receipt-item">
            <span>Service (10%)</span>
            <span>RM {receiptData.service.toFixed(2)}</span>
          </div>
          <div className="receipt-item">
            <span>Tax (6%)</span>
            <span>RM {receiptData.tax.toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt-total">
          <span>TOTAL</span>
          <span>RM {receiptData.total.toFixed(2)}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', textAlign: 'right' }}>
          Inclusive of service charge and tax
        </div>
      </div>

      {clickable && (
        <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '10px' }}>
          👆 Tap receipt to start splitting
        </div>
      )}
    </div>
  )
}

export default ReceiptStep

