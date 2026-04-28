// Safe, isolated API Gateway parser helper.
// This file does NOT modify existing api.js behavior.

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com'

const normalizeParsedItems = (payload, receiptItems = []) => {
  // Handle grouped response shape:
  // [{ person: "Lisa", items: ["Green Tea", "Burger"] }]
  const grouped = payload?.parsed_by_person || payload?.data?.parsed_by_person || []
  if (Array.isArray(grouped) && grouped.length > 0) {
    const flattened = []
    grouped.forEach((row) => {
      const person = row?.person || row?.name || row?.user
      const items = Array.isArray(row?.items) ? row.items : []
      items.forEach((it) => {
        const label = typeof it === 'string' ? it : it?.item || it?.name
        let price = Number(typeof it === 'string' ? 0 : it?.price ?? it?.amount ?? 0)
        if ((!price || Number.isNaN(price)) && label) {
          const matched = receiptItems.find((r) =>
            r?.name?.toLowerCase().includes(String(label).toLowerCase())
          )
          if (matched?.price) price = Number(matched.price)
        }
        if (person && label && price) {
          flattened.push({ person, item: label, price })
        }
      })
    })
    if (flattened.length > 0) return flattened
  }

  const candidates =
    payload?.parsed ||
    payload?.data?.parsed ||
    payload?.result ||
    payload?.items ||
    []

  if (!Array.isArray(candidates)) return []

  return candidates
    .map((row) => {
      const person = row.person || row.name || row.user || row.payer
      const item = row.item || row.item_name || row.product || row.description
      let price = Number(row.price ?? row.amount ?? 0)

      // If API doesn't return price, recover from receipt item name match.
      if ((!price || Number.isNaN(price)) && item) {
        const matched = receiptItems.find((r) =>
          r?.name?.toLowerCase().includes(String(item).toLowerCase())
        )
        if (matched?.price) price = Number(matched.price)
      }

      if (!person || !item || !price) return null
      return { person, item, price }
    })
    .filter(Boolean)
}

export async function parseBillViaGatewaySafe(
  input,
  receiptItems,
  apiBaseUrl = DEFAULT_API_BASE_URL
) {
  const body = {
    input,
    receipt_items: receiptItems
  }

  // Prefer /parse-bill (your current API route), fallback /ai/parse-bill.
  const endpoints = [`${apiBaseUrl}/parse-bill`, `${apiBaseUrl}/ai/parse-bill`]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) continue
      const json = await response.json()
      const parsed = normalizeParsedItems(json, receiptItems)
      if (parsed.length > 0) return { success: true, parsed, raw: json, endpoint }
    } catch {
      // Try next endpoint.
    }
  }

  return { success: false, parsed: [], raw: null, endpoint: null }
}
