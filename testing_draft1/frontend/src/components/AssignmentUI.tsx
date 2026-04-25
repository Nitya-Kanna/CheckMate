import type { ReceiptItem, Contact, Assignment } from '../types';

interface AssignmentUIProps {
  items: ReceiptItem[];
  contacts: Contact[];
  assignments: Assignment[];
  onAssign: (assignments: Assignment[]) => void;
}

export default function AssignmentUI({ items, contacts, assignments: _assignments, onAssign: _onAssign }: AssignmentUIProps) {
  void _assignments;
  void _onAssign;

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-3">Assign Items</h2>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b">
          <span className="flex-1">{item.name} — RM {item.totalPrice.toFixed(2)}</span>
          <select className="px-3 py-1 border rounded-lg">
            <option value="">Who ordered this?</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
