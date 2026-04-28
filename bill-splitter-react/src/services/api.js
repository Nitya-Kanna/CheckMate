// API Service for Bill Splitter

const API_BASE_URL = 'https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com'

/**
 * Get all receipts for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of receipts to fetch
 * @param {number} offset - Pagination offset
 * @param {string} status - Filter by status (all|ready_to_split|completed)
 * @returns {Promise<Object>} Receipts data
 */
export const getReceipts = async (userId = 'user_123', limit = 20, offset = 0, status = 'all') => {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      offset: offset.toString(),
      status
    })

    const response = await fetch(`${API_BASE_URL}/receipts?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching receipts:', error)
    throw error
  }
}

/**
 * Get a single receipt by ID
 * @param {string} receiptId - Receipt ID
 * @returns {Promise<Object>} Receipt data
 */
export const getReceiptById = async (receiptId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching receipt:', error)
    throw error
  }
}

/**
 * Parse bill with AI
 * @param {string} input - Natural language input
 * @param {Array} receiptItems - Receipt items
 * @returns {Promise<Object>} Parsed data
 */
export const parseBillWithAI = async (input, receiptItems) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/parse-bill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        receipt_items: receiptItems
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error parsing bill:', error)
    // Fallback to local parsing if API fails
    return null
  }
}

/**
 * Get all contacts for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of contacts to fetch
 * @param {string} search - Search query to filter contacts
 * @returns {Promise<Object>} Contacts data
 */
export const getContacts = async (userId = 'user_123', limit = 50, search = '') => {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }

    const response = await fetch(`${API_BASE_URL}/contacts?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching contacts:', error)
    throw error
  }
}

/**
 * Search contacts (alias for getContacts with search)
 * @param {string} query - Search query
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Contact matches
 */
export const searchContacts = async (query, userId = 'user_123') => {
  return getContacts(userId, 50, query)
}

/**
 * Generate payment QR code
 * @param {Object} person - Person details
 * @param {number} amount - Amount to pay
 * @returns {Promise<Object>} QR code data
 */
export const generatePaymentQR = async (person, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        person,
        amount
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export default {
  getReceipts,
  getReceiptById,
  getContacts,
  parseBillWithAI,
  searchContacts,
  generatePaymentQR
}

// Made with Bob
