import { useState, useEffect } from 'react'
import { User, Check, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import { getContacts } from '../../services/api'

function ConfirmStep({ parsedData, receiptData, onConfirm }) {
  const [expandedPerson, setExpandedPerson] = useState(null)
  const [confirmedContacts, setConfirmedContacts] = useState({})
  const [allContacts, setAllContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editedData, setEditedData] = useState(parsedData)
  const [editingIndex, setEditingIndex] = useState(null)

  // Fetch contacts from API on component mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        const data = await getContacts('user_123', 50)
        if (data.success && data.contacts) {
          // Transform API contacts to match expected format
          const transformedContacts = data.contacts.map(contact => ({
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            avatar: contact.avatar,
            contact_id: contact.contact_id
          }))
          setAllContacts(transformedContacts)
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
        // Fallback to empty array if API fails
        setAllContacts([])
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const handlePersonClick = (person) => {
    setExpandedPerson(expandedPerson === person ? null : person)
  }

  const handleContactSelect = (person, contact) => {
    setConfirmedContacts({
      ...confirmedContacts,
      [person]: contact
    })
    setExpandedPerson(null)
  }

  const getMatchingContacts = (personName) => {
    return allContacts.filter(c =>
      c.name.toLowerCase().includes(personName.toLowerCase())
    )
  }

  const handleItemChange = (index, newItemName) => {
    const selectedItem = receiptData.items.find(item => item.name === newItemName)
    if (selectedItem) {
      const updated = [...editedData]
      updated[index] = {
        ...updated[index],
        item: selectedItem.name,
        price: selectedItem.price
      }
      setEditedData(updated)
    }
  }

  const handlePriceChange = (index, newPrice) => {
    const updated = [...editedData]
    updated[index] = {
      ...updated[index],
      price: parseFloat(newPrice) || 0
    }
    setEditedData(updated)
  }

  const handleConfirm = () => {
    const confirmed = editedData.map(item => ({
      ...item,
      contact: confirmedContacts[item.person] || { name: item.person, phone: 'Not linked' }
    }))
    onConfirm(confirmed)
  }

  const groupedByPerson = editedData.reduce((acc, item, index) => {
    if (!acc[item.person]) acc[item.person] = []
    acc[item.person].push({ ...item, _idx: index })
    return acc
  }, {})

  const people = Object.keys(groupedByPerson)
  const allConfirmed = people.every(person => confirmedContacts[person])

  return (
    <>
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Loading Contacts...</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Fetching your contacts from server</div>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">Confirm & Edit Assignments</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            Review and edit meal assignments, then link contacts ({allContacts.length} available)
          </div>

          {people.map((person, groupIndex) => {
            const personItems = groupedByPerson[person] || []
            const matchingContacts = getMatchingContacts(person)
            const isExpanded = expandedPerson === person
            const isConfirmed = confirmedContacts[person]

            return (
              <div key={groupIndex} style={{ marginBottom: '15px', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '12px', background: 'white' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a1a', marginBottom: '10px' }}>
                  {person}
                </div>

                {/* Person items */}
                {personItems.map((item) => {
                  const isEditing = editingIndex === item._idx
                  return (
                    <div key={item._idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f1f1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {isEditing
                            ? 'Editing item'
                            : (
                              <>
                                {item.item} - <span style={{ fontWeight: '600', color: '#1a1a1a' }}>RM {item.price.toFixed(2)}</span>
                              </>
                            )}
                        </div>
                        <button
                          onClick={() => setEditingIndex(isEditing ? null : item._idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0066CC',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '13px',
                            padding: '5px 10px'
                          }}
                        >
                          <Edit2 size={14} />
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                      </div>

                      {isEditing && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                              Item
                            </label>
                            <select
                              value={item.item}
                              onChange={(e) => handleItemChange(item._idx, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '14px',
                                background: 'white'
                              }}
                            >
                              {receiptData.items.map((receiptItem, idx) => (
                                <option key={idx} value={receiptItem.name}>
                                  {receiptItem.name} - RM {receiptItem.price.toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>
                              Price (RM)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handlePriceChange(item._idx, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Contact Selection */}
                <div
                  className="contact-option"
                  onClick={() => handlePersonClick(person)}
                  style={{ cursor: 'pointer', marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}
                >
                  <div className="contact-phone" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                    {isConfirmed ? (
                      <><Check size={14} color="#4CAF50" /> Linked to {isConfirmed.name} ({isConfirmed.phone})</>
                    ) : (
                      <><User size={14} /> Select contact {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</>
                    )}
                  </div>
                </div>

                {isExpanded && !isConfirmed && (
                  <div style={{
                    marginTop: '5px',
                    marginLeft: '15px',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    {matchingContacts.length > 0 ? (
                      matchingContacts.map((contact, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleContactSelect(person, contact)}
                          style={{
                            padding: '10px',
                            marginBottom: idx < matchingContacts.length - 1 ? '5px' : '0',
                            background: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>
                            {contact.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {contact.phone}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '10px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                        No matching contacts found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <button
            className="primary-btn"
            onClick={handleConfirm}
            disabled={!allConfirmed}
            style={{ opacity: allConfirmed ? 1 : 0.5, marginTop: '15px' }}
          >
            {allConfirmed ? 'Confirm All Contacts' : 'Please link all contacts'}
          </button>
        </div>
      )}
    </>
  )
}

export default ConfirmStep

