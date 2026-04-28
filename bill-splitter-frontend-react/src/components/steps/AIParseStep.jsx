import { useState } from 'react'
import { Bot, Lightbulb } from 'lucide-react'

function AIParseStep({ aiInput, setAiInput, receiptData, onParse }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleParse = () => {
    setIsProcessing(true)

    setTimeout(() => {
      // Simulate AI parsing
      const lines = aiInput.toLowerCase().split(/[,\n]+/).map(l => l.trim()).filter(l => l)
      const parsed = []

      lines.forEach(line => {
        const ateMatch = line.match(/(\w+)\s+ate\s+(.+)/)
        if (ateMatch) {
          const person = ateMatch[1].charAt(0).toUpperCase() + ateMatch[1].slice(1)
          const itemName = ateMatch[2].trim()
          
          // Find matching item in receipt
          const matchedItem = receiptData.items.find(item =>
            item.name.toLowerCase().includes(itemName) ||
            itemName.includes(item.name.toLowerCase())
          )

          if (matchedItem) {
            parsed.push({
              person,
              item: matchedItem.name,
              price: matchedItem.price
            })
          }
        }
      })

      setIsProcessing(false)
      onParse(parsed)
    }, 2000)
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Tell us who ate what</div>
        <textarea
          className="input-field"
          placeholder="Example:&#10;Zin ate nasi lemak&#10;Lisa ate pizza&#10;John ate pasta"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
        />
        <div className="hint">
          <Lightbulb size={14} style={{ display: 'inline', marginRight: '5px' }} />
          Use natural language like "Zin ate nasi lemak, Lisa ate pizza"
        </div>
        <button
          className="primary-btn"
          onClick={handleParse}
          disabled={!aiInput.trim() || isProcessing}
        >
          {isProcessing ? 'Processing with AI...' : 'Parse with AI'}
        </button>
      </div>

      {isProcessing && (
        <div className="card">
          <div className="ai-processing">
            <div className="ai-icon"><Bot size={40} /></div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
              AI Processing...
            </div>
            <div style={{ fontSize: '13px', opacity: '0.9' }}>
              Analyzing your input and matching items
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIParseStep

// Made with Bob
