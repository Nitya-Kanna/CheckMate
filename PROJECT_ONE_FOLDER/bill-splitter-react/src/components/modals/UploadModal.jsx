import { useState } from 'react'
import { Camera, X, Search, Upload, Image } from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com'

function UploadModal({ onClose, onUploadSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result || ''))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    setError('')

    // Show preview
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    if (selectedFile.type === 'application/pdf') {
      setError('PDF OCR is not enabled yet. Please upload JPG or PNG.')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError('')

    try {
      const dataUrl = await toBase64(selectedFile)
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
      setProgress(35)

      const endpoints = [`${API_BASE_URL}/parse-bill`, `${API_BASE_URL}/ai/parse-bill`]
      let ocrPayload = null
      let lastErrorMessage = ''

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receipt_image_base64: base64,
              receipt_image_mime_type: selectedFile.type || 'image/jpeg'
            })
          })
          const json = await response.json()
          if (!response.ok) {
            throw new Error(json?.error || json?.message || `OCR failed (${response.status})`)
          }
          if (json?.success && json?.receipt) {
            ocrPayload = json
            break
          }
        } catch (endpointError) {
          lastErrorMessage = endpointError?.message || 'OCR request failed.'
          // Try fallback endpoint.
        }
      }

      if (!ocrPayload?.receipt) {
        throw new Error(lastErrorMessage || 'OCR endpoint unavailable or returned no receipt data.')
      }

      setProgress(85)
      const receipt = ocrPayload.receipt
      const newReceipt = {
        receipt_id: `rcpt_${Date.now()}`,
        restaurant_name: receipt.restaurant_name || 'Scanned Receipt',
        subtotal: Number(receipt.subtotal || 0),
        tax: Number(receipt.tax || 0),
        service: Number(receipt.service || 0),
        total: Number(receipt.total || 0),
        date: receipt.date || new Date().toISOString().split('T')[0],
        time: receipt.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'ready_to_split',
        items: Array.isArray(receipt.items) ? receipt.items : [],
        items_count: Array.isArray(receipt.items) ? receipt.items.length : 0
      }

      setProgress(100)
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
        onUploadSuccess(newReceipt)
      }, 400)
    } catch (err) {
      setIsProcessing(false)
      setProgress(0)
      setError(err.message || 'Failed to process receipt.')
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Upload Receipt</div>
          <div className="close-btn" onClick={onClose}><X size={24} /></div>
        </div>

        {!selectedFile && !isProcessing ? (
          <>
            <label htmlFor="file-upload" className="upload-area">
              <div className="upload-icon"><Camera size={48} /></div>
              <div className="upload-text">
                Tap to take photo or select from gallery
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Supports JPG, PNG, PDF
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </>
        ) : selectedFile && !isProcessing ? (
          <div style={{ padding: '20px' }}>
            {/* Image Preview */}
            {previewUrl && (
              <div style={{
                marginBottom: '20px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #e0e0e0'
              }}>
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    background: '#f5f5f5'
                  }}
                />
              </div>
            )}
            
            {/* File Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <Image size={24} color="#0066CC" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="secondary-btn"
                onClick={handleCancel}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleUpload}
                style={{ flex: 1 }}
              >
                <Upload size={18} style={{ marginRight: '8px' }} />
                Upload
              </button>
            </div>
            {error && (
              <div style={{ marginTop: '12px', color: '#c62828', fontSize: '12px' }}>
                {error}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="upload-icon" style={{ animation: 'spin 2s linear infinite' }}>
              <Search size={48} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', margin: '15px 0' }}>
              Processing Receipt...
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
              Extracting items and prices with OCR
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              {progress}% complete
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadModal

// Made with Bob
