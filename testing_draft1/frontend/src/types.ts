export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Receipt {
  id: string;
  imageUrl: string;
  restaurant: string;
  items: ReceiptItem[];
  tax: number;
  total: number;
  status: 'uploaded' | 'extracted' | 'split' | 'shared' | 'settled';
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  source: 'manual' | 'llm-discovered' | 'tng-lookup';
  isTngVerified: boolean;
  createdAt: string;
}

export interface Assignment {
  contactId: string;
  items: { itemIndex: number; shareRatio: number }[];
  amount: number;
  paymentStatus: 'unpaid' | 'paid' | 'declined';
  sharedAt: string | null;
  paidAt: string | null;
}

export interface DiscoveredPerson {
  name: string;
  matchStatus: 'found' | 'new';
  matchedContactId: string | null;
  suggestedPhone: string | null;
}

export interface OcrResponse {
  restaurant: string | null;
  items: { name: string; quantity: number; unit_price: number; total_price: number }[];
  tax: number;
  total: number;
  currency: string;
}

export interface NlpSplitResponse {
  discovered_people: DiscoveredPerson[];
  assignments: { person: string; items: { item_index: number; share_ratio: number }[]; amount: number }[];
}

export interface ManualSplitResponse {
  person_totals: { person: string; amount: number }[];
}

export interface MessageResponse {
  message: string;
  tng_link: string;
  wa_me_link: string;
}
