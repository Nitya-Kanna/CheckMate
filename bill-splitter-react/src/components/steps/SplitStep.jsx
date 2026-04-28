function SplitStep({ confirmedData, receiptData, onNext }) {
  const toCents = (amount) => Math.round((Number(amount) || 0) * 100)
  const centsToAmount = (cents) => cents / 100

  const allocateProportionally = (totalAmount, weights) => {
    const totalCents = toCents(totalAmount)
    const safeWeights = weights.map((w) => Number(w) || 0)
    const totalWeight = safeWeights.reduce((sum, w) => sum + w, 0)

    if (totalCents === 0 || totalWeight <= 0) {
      return safeWeights.map(() => 0)
    }

    const rawAllocations = safeWeights.map((weight) => (totalCents * weight) / totalWeight)
    const baseAllocations = rawAllocations.map((value) => Math.floor(value))
    let remainder = totalCents - baseAllocations.reduce((sum, value) => sum + value, 0)

    // Distribute remaining cents to people with largest fractional remainders.
    const order = rawAllocations
      .map((value, index) => ({ index, frac: value - Math.floor(value) }))
      .sort((a, b) => b.frac - a.frac)

    for (let i = 0; i < remainder; i += 1) {
      baseAllocations[order[i % order.length].index] += 1
    }

    return baseAllocations.map(centsToAmount)
  }

  // Group items by person
  const personTotals = {}
  
  confirmedData.forEach(item => {
    if (!personTotals[item.person]) {
      personTotals[item.person] = {
        contact: item.contact,
        items: [],
        subtotal: 0
      }
    }
    personTotals[item.person].items.push(item)
    personTotals[item.person].subtotal += item.price
  })

  // Calculate proportional charges
  const totalSubtotal = Object.values(personTotals).reduce((sum, p) => sum + p.subtotal, 0)
  const entries = Object.entries(personTotals)
  const weights = entries.map(([, data]) => data.subtotal)
  const allocatedTax = allocateProportionally(receiptData.tax, weights)
  const allocatedService = allocateProportionally(receiptData.service, weights)

  const splitResult = entries.map(([person, data], index) => {
    const tax = allocatedTax[index]
    const service = allocatedService[index]
    const total = data.subtotal + tax + service

    return {
      person,
      contact: data.contact,
      items: data.items,
      subtotal: data.subtotal,
      tax,
      service,
      total
    }
  })

  return (
    <>
      <div className="card">
        <div className="card-title">Bill Split Summary</div>
        
        {splitResult.map((person, index) => (
          <div key={index} className="person-card">
            <div className="person-header">
              <div>
                <div className="person-name">{person.contact.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{person.contact.phone}</div>
              </div>
              <div className="person-total">RM {person.total.toFixed(2)}</div>
            </div>
            
            <div className="item-list">
              {person.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>{item.item}</span>
                  <span>RM {item.price.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #ddd', marginTop: '8px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '12px' }}>
                  <span>Subtotal</span>
                  <span>RM {person.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '12px' }}>
                  <span>Tax (proportional)</span>
                  <span>RM {person.tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '12px' }}>
                  <span>Service (proportional)</span>
                  <span>RM {person.service.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="primary-btn" onClick={() => onNext(splitResult)}>
          Generate Payment QR Codes
        </button>
      </div>
    </>
  )
}

export default SplitStep

// Made with Bob
