import { useState, useRef } from 'react';

interface ReceiptUploadProps {
  onUpload: (imageBase64: string) => void;
  isLoading?: boolean;
}

export default function ReceiptUpload({ onUpload, isLoading }: ReceiptUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl">
      <h2 className="text-xl font-semibold">Snap or upload your receipt</h2>
      {preview && (
        <img src={preview} alt="Receipt preview" className="max-h-48 rounded-lg shadow" />
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Reading your receipt...' : '📷 Upload Receipt'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
