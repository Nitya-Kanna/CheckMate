import { useState } from 'react'
import { Camera, X, Search, Upload, Image } from 'lucide-react'

function UploadModal({ onClose, onUploadSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

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

    setIsProcessing(true)
    setProgress(0)

    // Simulate upload and OCR processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            // Create a mock receipt object
            const newReceipt = {
              receipt_id: `rcpt_${Date.now()}`,
              restaurant_name: 'New Receipt',
              total: 0,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              status: 'ready_to_split',
              items: [],
              items_count: 0
            }
            
            setIsProcessing(false)
            setProgress(0)
            onUploadSuccess(newReceipt)
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
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
