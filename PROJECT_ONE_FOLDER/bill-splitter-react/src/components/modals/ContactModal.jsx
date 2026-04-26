import { User, X } from 'lucide-react'

function ContactModal({ isOpen, onClose, person, contacts, onSelect }) {
  if (!isOpen) return null

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Select Contact for {person}</div>
          <div className="close-btn" onClick={onClose}><X size={24} /></div>
        </div>

        <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
          {contacts.length > 1
            ? `Found ${contacts.length} contacts matching "${person}"`
            : contacts.length === 1
            ? 'Found 1 matching contact'
            : 'No matching contacts found'
          }
        </div>

        {contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <div
              key={index}
              className="contact-option"
              onClick={() => onSelect(contact)}
            >
              <div className="contact-name">{contact.name}</div>
              <div className="contact-phone">{contact.phone}</div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>
              <User size={40} />
            </div>
            <div>No contacts found</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              You can still continue without linking
            </div>
          </div>
        )}

        {contacts.length === 0 && (
          <button
            className="primary-btn"
            onClick={() => onSelect({ name: person, phone: 'Not linked' })}
          >
            Continue Without Contact
          </button>
        )}
      </div>
    </div>
  )
}

export default ContactModal

// Made with Bob
