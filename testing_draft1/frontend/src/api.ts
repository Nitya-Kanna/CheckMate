const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function uploadReceiptForOcr(imageBase64: string) {
  const res = await fetch(`${API_BASE}/api/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) throw new Error(`OCR failed: ${res.statusText}`);
  return res.json();
}

export async function nlpSplit(items: unknown[], contacts: unknown[], prompt: string) {
  const res = await fetch(`${API_BASE}/api/split/nlp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, contacts, prompt }),
  });
  if (!res.ok) throw new Error(`NLP split failed: ${res.statusText}`);
  return res.json();
}

export async function manualSplit(items: unknown[], assignments: unknown[]) {
  const res = await fetch(`${API_BASE}/api/split/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, assignments }),
  });
  if (!res.ok) throw new Error(`Manual split failed: ${res.statusText}`);
  return res.json();
}

export async function generateMessage(fromName: string, toName: string, amount: number, restaurant: string, phone: string) {
  const res = await fetch(`${API_BASE}/api/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from_name: fromName, to_name: toName, amount, restaurant, phone }),
  });
  if (!res.ok) throw new Error(`Message generation failed: ${res.statusText}`);
  return res.json();
}
