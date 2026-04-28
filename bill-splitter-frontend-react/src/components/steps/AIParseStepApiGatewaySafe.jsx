import { useState } from 'react'
import { Bot, Lightbulb } from 'lucide-react'
import { parseBillViaGatewaySafe } from '../../services/parseBillGatewaySafe'

// Safe alternative to AIParseStep.jsx.
// Keep existing file untouched; import this one only when you are ready.
function AIParseStepApiGatewaySafe({ aiInput, setAiInput, receiptData, onParse }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [hint, setHint] = useState('')

  const localFallback = () => {
    const lowerInput = aiInput.toLowerCase()
    const lines = lowerInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const parsed = []
    const seen = new Set()
    const stopwords = new Set(['the', 'a', 'an', 'from', 'receipt', 'receipts', 'item', 'items'])
    let currentPerson = null

    const pushMatchedToken = (person, token) => {
      const tokenWords = token
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9]/gi, '').trim())
        .filter((w) => w && !stopwords.has(w))

      const matched = receiptData.items.find((item) => {
        const itemName = item.name.toLowerCase()
        const direct = itemName.includes(token) || token.includes(itemName)
        if (direct) return true

        // Fuzzy fallback: require at least one meaningful word overlap.
        // This makes short phrases like "miso", "salmon" and "california roll"
        // match menu items such as "Miso Soup", "Salmon Sashimi", etc.
        return tokenWords.some((word) => itemName.includes(word))
      })

      if (!matched) return

      const rowKey = `${person}::${matched.name}`
      if (seen.has(rowKey)) return
      seen.add(rowKey)

      parsed.push({ person, item: matched.name, price: matched.price })
    }

    lines.forEach((line) => {
      // Format A:
      // Lisa:
      // - green tea
      // - burger
      const personHeader = line.match(/^([a-z][a-z0-9 _-]{1,30})\s*:\s*$/i)
      if (personHeader) {
        currentPerson = personHeader[1].trim().charAt(0).toUpperCase() + personHeader[1].trim().slice(1)
        return
      }

      // If we're inside "Person:" block, treat each bullet/line as item.
      if (currentPerson && /^[-*•]?\s*[a-z0-9]/i.test(line)) {
        const cleanItem = line.replace(/^[-*•]\s*/, '').trim()
        if (cleanItem) {
          cleanItem
            .split(/\s*(?:,|and|&|\+)\s*/i)
            .map((t) => t.replace(/\b(one|two|three|four|five|the|a|an)\b/gi, '').trim())
            .filter(Boolean)
            .forEach((token) => pushMatchedToken(currentPerson, token))
          return
        }
      }

      const match = line.match(/(\w+)\s+(?:eat|eats|ate|had|ordered|got)\s+(.+)/)
      const inlineGroup = line.match(/^([a-z][a-z0-9 _-]{1,30})\s*:\s*(.+)$/i)
      if (!match && !inlineGroup) {
        currentPerson = null
        return
      }

      const person = (match ? match[1] : inlineGroup[1]).charAt(0).toUpperCase() + (match ? match[1] : inlineGroup[1]).slice(1)
      let itemText = (match ? match[2] : inlineGroup[2]).trim()
      itemText = itemText.replace(/\bfrom\b.*$/i, '').trim()

      // Support multi-item phrases like:
      // "lisa ate green tea and burger", "zin ate fries, coke & pasta"
      const itemTokens = itemText
        .split(/\s*(?:,|and|&|\+)\s*/i)
        .map((t) => t.replace(/\b(one|two|three|four|five|the|a|an)\b/gi, '').trim())
        .filter(Boolean)

      itemTokens.forEach((token) => {
        pushMatchedToken(person, token)
      })
    })

    // Format C (single line / comma-separated clauses):
    // "lisa ate miso and salmon, zin ate green tea and california roll"
    // Capture each person-clause independently.
    const clauseRegex = /(\w+)\s+(?:eat|eats|ate|had|ordered|got)\s+([^,\n]+)/gi
    let clause
    while ((clause = clauseRegex.exec(lowerInput)) !== null) {
      const person = clause[1].charAt(0).toUpperCase() + clause[1].slice(1)
      const itemText = clause[2].replace(/\bfrom\b.*$/i, '').trim()
      itemText
        .split(/\s*(?:and|&|\+)\s*/i)
        .map((t) => t.replace(/\b(one|two|three|four|five|the|a|an)\b/gi, '').trim())
        .filter(Boolean)
        .forEach((token) => pushMatchedToken(person, token))
    }

    return parsed
  }

  const handleParse = async () => {
    if (!aiInput.trim()) return
    setIsProcessing(true)
    setHint('')

    const gatewayResult = await parseBillViaGatewaySafe(aiInput, receiptData.items)

    if (gatewayResult.success) {
      setHint(`Parsed via API route: ${gatewayResult.endpoint}`)
      setIsProcessing(false)
      onParse(gatewayResult.parsed)
      return
    }

    // Safety net to avoid breaking flow if backend fails.
    const parsed = localFallback()
    setHint(
      parsed.length
        ? 'API unavailable, used local fallback parser.'
        : 'No matches found. Try short phrases like "Zin ate nasi lemak".'
    )
    setIsProcessing(false)
    onParse(parsed)
  }

  return (
    <>
      <div className="card">
        <div className="card-title">Tell us who ate what (API Gateway Safe)</div>
        <textarea
          className="input-field"
          placeholder="Example:&#10;Zin ate nasi lemak&#10;Lisa ate pizza&#10;John ate pasta"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
        />
        <div className="hint">
          <Lightbulb size={14} style={{ display: 'inline', marginRight: '5px' }} />
          This safe step tries API Gateway first, then falls back locally if needed.
        </div>
        <button
          className="primary-btn"
          onClick={handleParse}
          disabled={!aiInput.trim() || isProcessing}
        >
          {isProcessing ? 'Processing with AI...' : 'Parse with AI (Gateway Safe)'}
        </button>
        {hint && (
          <div className="hint" style={{ marginTop: '8px', color: '#1A5FB4', fontWeight: 600 }}>
            {hint}
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="card">
          <div className="ai-processing">
            <div className="ai-icon"><Bot size={40} /></div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
              AI Processing...
            </div>
            <div style={{ fontSize: '13px', opacity: '0.9' }}>
              Sending request to API Gateway and mapping items...
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIParseStepApiGatewaySafe
