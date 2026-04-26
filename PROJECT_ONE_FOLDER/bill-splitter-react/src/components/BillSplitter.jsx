import { useState, useEffect } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { getReceipts } from '../services/api'
import ReceiptStep from './steps/ReceiptStep'
import AIParseStep from './steps/AIParseStepApiGatewaySafe'
import ConfirmStep from './steps/ConfirmStep'
import RequestSentStep from './steps/RequestSentStep'
import SplitStep from './steps/SplitStep'
import PaymentStep from './steps/PaymentStep'

function BillSplitter({ onBack, selectedReceipt }) {
  const toCents = (amount) => Math.round((Number(amount) || 0) * 100)
  const centsToAmount = (cents) => cents / 100

  const allocateCentsByWeight = (totalCents, weights) => {
    const safeWeights = weights.map((w) => Number(w) || 0)
    const totalWeight = safeWeights.reduce((sum, w) => sum + w, 0)

    if (totalCents <= 0 || totalWeight <= 0) {
      return safeWeights.map(() => 0)
    }

    const raw = safeWeights.map((weight) => (totalCents * weight) / totalWeight)
    const base = raw.map((value) => Math.floor(value))
    let remainder = totalCents - base.reduce((sum, value) => sum + value, 0)

    const order = raw
      .map((value, index) => ({ index, frac: value - Math.floor(value) }))
      .sort((a, b) => b.frac - a.frac)

    for (let i = 0; i < remainder; i += 1) {
      base[order[i % order.length].index] += 1
    }

    return base
  }

  const normalizeReceiptToInclusiveItems = (receipt) => {
    const items = Array.isArray(receipt.items) ? receipt.items : []
    const chargesCents = toCents(receipt.tax) + toCents(receipt.service)
    if (!items.length || chargesCents <= 0) {
      return {
        ...receipt,
        tax: Number(receipt.tax) || 0,
        service: Number(receipt.service) || 0,
        subtotal: Number(receipt.subtotal) || 0,
        total: Number(receipt.total) || 0
      }
    }

    const itemCents = items.map((item) => toCents(item.price))
    const allocatedChargeCents = allocateCentsByWeight(chargesCents, itemCents)
    const inclusiveItems = items.map((item, index) => ({
      ...item,
      price: centsToAmount(itemCents[index] + allocatedChargeCents[index])
    }))

    const inclusiveSubtotalCents = inclusiveItems.reduce((sum, item) => sum + toCents(item.price), 0)

    return {
      ...receipt,
      items: inclusiveItems,
      subtotal: centsToAmount(inclusiveSubtotalCents),
      tax: 0,
      service: 0,
      total: centsToAmount(inclusiveSubtotalCents)
    }
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [receiptData, setReceiptData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aiInput, setAiInput] = useState('')
  const [parsedData, setParsedData] = useState([])
  const [confirmedData, setConfirmedData] = useState([])
  const [splitResult, setSplitResult] = useState([])

  // Use selected receipt or fetch if not provided
  useEffect(() => {
    if (selectedReceipt) {
      // Use the selected receipt directly
      setReceiptData(normalizeReceiptToInclusiveItems({
        receipt_id: selectedReceipt.receipt_id,
        restaurant_name: selectedReceipt.restaurant_name,
        date: selectedReceipt.date,
        time: selectedReceipt.time,
        items: selectedReceipt.items,
        subtotal: selectedReceipt.subtotal,
        tax: selectedReceipt.tax,
        service: selectedReceipt.service,
        total: selectedReceipt.total
      }))
      setLoading(false)
      // Automatically go to AI Parse step (step 2) when receipt is selected
      setCurrentStep(2)
    } else {
      // Fallback: fetch a receipt if none selected
      const fetchReceipt = async () => {
        try {
          setLoading(true)
          const response = await getReceipts('user_123', 1, 0, 'ready_to_split')
          
          if (response.success && response.receipts.length > 0) {
            const receipt = response.receipts[0]
            setReceiptData(normalizeReceiptToInclusiveItems({
              receipt_id: receipt.receipt_id,
              restaurant_name: receipt.restaurant_name,
              date: receipt.date,
              time: receipt.time,
              items: receipt.items,
              subtotal: receipt.subtotal,
              tax: receipt.tax,
              service: receipt.service,
              total: receipt.total
            }))
          } else {
            setError('No receipts found')
          }
        } catch (err) {
          console.error('Error fetching receipt:', err)
          setError('Failed to load receipt')
        } finally {
          setLoading(false)
        }
      }

      fetchReceipt()
    }
  }, [selectedReceipt])

  const steps = [
    { number: 1, label: 'Receipt' },
    { number: 2, label: 'AI Parse' },
    { number: 3, label: 'Confirm' },
    { number: 4, label: 'Requests' },
    { number: 5, label: 'Split' },
    { number: 6, label: 'Pay' }
  ]

  const getStepClass = (stepNum) => {
    if (stepNum < currentStep) return 'step completed'
    if (stepNum === currentStep) return 'step active'
    return 'step'
  }

  const getStepNumber = (stepNum) => {
    if (stepNum < currentStep) return <Check size={16} />
    return stepNum
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <div className="splitter-header">
          <div className="back-btn" onClick={onBack}><ArrowLeft size={24} /></div>
          <div className="header-title">AI Bill Splitter</div>
        </div>
        <div className="splitter-content">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Loading Receipt...</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Fetching data from server</div>
          </div>
        </div>
      </>
    )
  }

  // Show error state
  if (error || !receiptData) {
    return (
      <>
        <div className="splitter-header">
          <div className="back-btn" onClick={onBack}><ArrowLeft size={24} /></div>
          <div className="header-title">AI Bill Splitter</div>
        </div>
        <div className="splitter-content">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>❌</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Error Loading Receipt</div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>{error || 'No receipt data available'}</div>
            <button className="primary-btn" onClick={onBack}>Go Back</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="splitter-header">
        <div className="back-btn" onClick={onBack}><ArrowLeft size={24} /></div>
        <div className="header-title">AI Bill Splitter</div>
      </div>

      <div className="splitter-content">
        <div className="step-indicator">
          {steps.map(step => (
            <div key={step.number} className={getStepClass(step.number)}>
              <div className="step-number">{getStepNumber(step.number)}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <ReceiptStep
            receiptData={receiptData}
            onNext={() => setCurrentStep(2)}
            clickable={true}
          />
        )}

        {currentStep === 2 && (
          <>
            <ReceiptStep
              receiptData={receiptData}
              clickable={false}
            />
            <AIParseStep
              aiInput={aiInput}
              setAiInput={setAiInput}
              receiptData={receiptData}
              onParse={(data) => {
                setParsedData(data)
                setCurrentStep(3)
              }}
            />
          </>
        )}

        {currentStep === 3 && (
          <ConfirmStep
            parsedData={parsedData}
            receiptData={receiptData}
            onConfirm={(data) => {
              setConfirmedData(data)
              setCurrentStep(4)
            }}
          />
        )}

        {currentStep === 4 && (
          <RequestSentStep
            confirmedData={confirmedData}
            onNext={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 5 && (
          <SplitStep
            confirmedData={confirmedData}
            receiptData={receiptData}
            onNext={(result) => {
              setSplitResult(result)
              setCurrentStep(6)
            }}
          />
        )}

        {currentStep === 6 && (
          <PaymentStep
            splitResult={splitResult}
            onReset={() => {
              setCurrentStep(1)
              setAiInput('')
              setParsedData([])
              setConfirmedData([])
              setSplitResult([])
            }}
          />
        )}
      </div>
    </>
  )
}

export default BillSplitter

// Made with Bob
