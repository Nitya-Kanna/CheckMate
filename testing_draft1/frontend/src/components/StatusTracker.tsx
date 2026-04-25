import type { Assignment, Contact } from '../types';

interface StatusTrackerProps {
  assignments: Assignment[];
  contacts: Contact[];
  onTogglePaid: (contactId: string) => void;
}

export default function StatusTracker({ assignments, contacts, onTogglePaid }: StatusTrackerProps) {
  const getContact = (id: string) => contacts.find((c) => c.id === id);

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-3">Payment Status</h2>
      {assignments.map((a, i) => {
        const contact = getContact(a.contactId);
        return (
          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <span className="font-medium">{contact?.name || 'Unknown'}</span>
              <span className="ml-2 text-gray-500">RM {a.amount.toFixed(2)}</span>
            </div>
            <button
              onClick={() => onTogglePaid(a.contactId)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                a.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {a.paymentStatus === 'paid' ? '✅ Paid' : '❌ Unpaid'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
