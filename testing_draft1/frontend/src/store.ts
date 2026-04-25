import { create } from 'zustand';
import type { Receipt, Contact, Assignment } from './types';

interface AppState {
  receipt: Receipt | null;
  contacts: Contact[];
  assignments: Assignment[];

  setReceipt: (r: Receipt) => void;
  addContact: (c: Contact) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  setAssignments: (a: Assignment[]) => void;
  togglePaidStatus: (contactId: string) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  receipt: null,
  contacts: [],
  assignments: [],

  setReceipt: (receipt) => set({ receipt }),

  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),

  updateContact: (id, patch) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),

  removeContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),

  setAssignments: (assignments) => set({ assignments }),

  togglePaidStatus: (contactId) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.contactId === contactId
          ? {
              ...a,
              paymentStatus: a.paymentStatus === 'paid' ? 'unpaid' : 'paid',
              paidAt: a.paymentStatus === 'paid' ? null : new Date().toISOString(),
            }
          : a
      ),
    })),

  resetSession: () => set({ receipt: null, contacts: [], assignments: [] }),
}));
