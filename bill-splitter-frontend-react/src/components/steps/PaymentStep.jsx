import { useState } from 'react'
import { QrCode, Smartphone } from 'lucide-react'

function PaymentStep({ splitResult, onReset }) {
  const [selectedPerson, setSelectedPerson] = useState(0)

  return (
    <>
      <div className="card">
        <div className="card-title">Payment QR Codes</div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
          Share these QR codes with each person to collect payment
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
          {splitResult.map((person, index) => (
            <button
              key={index}
              onClick={() => setSelectedPerson(index)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedPerson === index ? '2px solid #1A5FB4' : '2px solid #e0e0e0',
                background: selectedPerson === index ? '#e3f2fd' : 'white',
                color: selectedPerson === index ? '#1A5FB4' : '#666',
                fontWeight: selectedPerson === index ? '600' : 'normal',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {person.contact.name}
            </button>
          ))}
        </div>

        <div className="qr-container">
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
            {splitResult[selectedPerson].contact.name}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            {splitResult[selectedPerson].contact.phone}
          </div>
          
          <div className="qr-code">
            <QrCode size={80} />
          </div>
          
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A5FB4', marginBottom: '10px' }}>
            RM {splitResult[selectedPerson].total.toFixed(2)}
          </div>
          
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Smartphone size={14} />
            Scan to pay via Touch 'n Go eWallet
          </div>

          <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '15px', textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Items:</div>
            {splitResult[selectedPerson].items.map((item, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#666', padding: '4px 0' }}>
                • {item.item} - RM {item.price.toFixed(2)}
              </div>
            ))}
          </div>
        </div>

        <button className="primary-btn" onClick={onReset}>
          Split Another Bill
        </button>
      </div>
    </>
  )
}

export default PaymentStep

