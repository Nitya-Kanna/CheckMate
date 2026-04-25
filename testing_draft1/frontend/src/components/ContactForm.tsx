import { useState } from 'react';
import type { Contact } from '../types';

interface ContactFormProps {
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
}

export default function ContactForm({ onAddContact }: ContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddContact({
      name: name.trim(),
      phone: phone.trim(),
      source: 'manual',
      isTngVerified: false,
    });
    setName('');
    setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Calvin"
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+6012-345-6789"
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
        + Add
      </button>
    </form>
  );
}
