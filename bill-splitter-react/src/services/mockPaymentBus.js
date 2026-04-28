const STORAGE_KEY = 'tng_mock_payment_requests_v1'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function makeId() {
  return `req_${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-4)}`
}

export function createRequestsFromConfirmedData(confirmedData, fromName = 'Friend') {
  const now = new Date().toISOString()
  const existing = readAll()

  const newRequests = confirmedData.map((item) => ({
    request_id: makeId(),
    from_user: {
      user_id: 'requester_001',
      name: fromName,
      phone: '+60111111111',
      avatar: '👤'
    },
    to_user: {
      user_id: item.contact?.contact_id || `contact_${item.person?.toLowerCase() || 'unknown'}`,
      name: item.contact?.name || item.person || 'Unknown',
      phone: item.contact?.phone || 'Not linked'
    },
    amount: Number(item.price || 0),
    currency: 'MYR',
    description: `${item.item} - Bill Split`,
    items: [{ name: item.item, price: Number(item.price || 0) }],
    restaurant: 'Restaurant',
    date: new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'pending',
    created_at: now,
    updated_at: now
  }))

  writeAll([...newRequests, ...existing])
  return newRequests
}

export function getRequestById(requestId) {
  return readAll().find((r) => r.request_id === requestId) || null
}

export function getIncomingRequestsForPayer(payerName) {
  return readAll()
    .filter((r) => (r.to_user?.name || '').toLowerCase() === (payerName || '').toLowerCase())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function updateRequestStatus(requestId, status) {
  const items = readAll()
  const idx = items.findIndex((r) => r.request_id === requestId)
  if (idx < 0) return null
  items[idx] = {
    ...items[idx],
    status,
    updated_at: new Date().toISOString()
  }
  writeAll(items)
  return items[idx]
}

export function clearMockRequests() {
  writeAll([])
}
