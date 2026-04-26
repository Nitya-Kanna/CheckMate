const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com'

async function safeJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function createPosEvent(payload) {
  const response = await fetch(`${API_BASE_URL}/pos/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const json = await safeJson(response)
  if (!response.ok) throw new Error(json?.message || `createPosEvent failed (${response.status})`)
  return json
}

export async function markTraceReceived(transactionId) {
  const response = await fetch(`${API_BASE_URL}/trace/received`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id: transactionId })
  })
  const json = await safeJson(response)
  if (!response.ok) throw new Error(json?.message || `markTraceReceived failed (${response.status})`)
  return json
}

export async function markTraceRendered(transactionId) {
  const response = await fetch(`${API_BASE_URL}/trace/rendered`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id: transactionId })
  })
  const json = await safeJson(response)
  if (!response.ok) throw new Error(json?.message || `markTraceRendered failed (${response.status})`)
  return json
}

export async function getTrace(transactionId) {
  const response = await fetch(`${API_BASE_URL}/trace/${transactionId}`)
  const json = await safeJson(response)
  if (!response.ok) throw new Error(json?.message || `getTrace failed (${response.status})`)
  return json
}
