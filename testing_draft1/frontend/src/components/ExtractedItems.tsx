import type { ReceiptItem } from '../types';

interface ExtractedItemsProps {
  restaurant: string;
  items: ReceiptItem[];
  tax: number;
  total: number;
}

export default function ExtractedItems({ restaurant, items, tax, total }: ExtractedItemsProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-2">🍽️ {restaurant}</h2>
      <ul className="divide-y divide-gray-100">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between py-2">
            <span>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
            <span className="font-medium">RM {item.totalPrice.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t mt-2 pt-2 space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tax</span>
          <span>RM {tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>RM {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
