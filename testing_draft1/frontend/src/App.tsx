import { useState } from 'react';
import { useAppStore } from './store';
import ReceiptUpload from './components/ReceiptUpload';
import ExtractedItems from './components/ExtractedItems';
import ContactForm from './components/ContactForm';
import AssignmentUI from './components/AssignmentUI';
import NLPSplit from './components/NLPSplit';
import ShareButton from './components/ShareButton';
import StatusTracker from './components/StatusTracker';
import { uploadReceiptForOcr, nlpSplit } from './api';
import type { Contact } from './types';

function App() {
  const { receipt, contacts, assignments, setReceipt, addContact, setAssignments, togglePaidStatus, resetSession } = useAppStore();
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isNlpLoading, setIsNlpLoading] = useState(false);

  const handleUpload = async (imageBase64: string) => {
    setIsOcrLoading(true);
    try {
      const data = await uploadReceiptForOcr(imageBase64);
      setReceipt({
        id: crypto.randomUUID(),
        imageUrl: imageBase64,
        restaurant: data.restaurant || 'Unknown Restaurant',
        items: data.items.map((item: { name: string; quantity: number; unit_price: number; total_price: number }) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        tax: data.tax,
        total: data.total,
        status: 'extracted',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    addContact({
      ...contactData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
  };

  const handleNlpSplit = async (prompt: string) => {
    if (!receipt) return;
    setIsNlpLoading(true);
    try {
      const data = await nlpSplit(receipt.items, contacts, prompt);
      // Process discovered people and assignments
      console.log('NLP Split result:', data);
    } catch (err) {
      console.error('NLP Split Error:', err);
    } finally {
      setIsNlpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <header className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Bill Splitter</h1>
          <p className="text-sm text-gray-500">Scan → Extract → Split → Share</p>
        </header>

        {/* Step 1: Upload Receipt */}
        {!receipt && (
          <ReceiptUpload onUpload={handleUpload} isLoading={isOcrLoading} />
        )}

        {/* Step 2: Show extracted items */}
        {receipt && (
          <ExtractedItems
            restaurant={receipt.restaurant}
            items={receipt.items}
            tax={receipt.tax}
            total={receipt.total}
          />
        )}

        {/* Step 3: Add contacts */}
        {receipt && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Who's splitting this bill?</h2>
            <ContactForm onAddContact={handleAddContact} />
            {contacts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contacts.map((c) => (
                  <span key={c.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Assign items */}
        {receipt && contacts.length > 0 && (
          <>
            <AssignmentUI
              items={receipt.items}
              contacts={contacts}
              assignments={assignments}
              onAssign={setAssignments}
            />
            <NLPSplit onSubmit={handleNlpSplit} isLoading={isNlpLoading} />
          </>
        )}

        {/* Step 5: Review & Share */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <StatusTracker
              assignments={assignments}
              contacts={contacts}
              onTogglePaid={togglePaidStatus}
            />
            {assignments.map((a, i) => {
              const contact = contacts.find((c) => c.id === a.contactId);
              if (!contact || !receipt) return null;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                  <span>{contact.name} — RM {a.amount.toFixed(2)}</span>
                  <ShareButton
                    personName={contact.name}
                    amount={a.amount}
                    restaurant={receipt.restaurant}
                    phone={contact.phone}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Reset */}
        {receipt && (
          <button
            onClick={resetSession}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
