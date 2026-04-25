interface ShareButtonProps {
  personName: string;
  amount: number;
  restaurant: string;
  phone: string;
}

export default function ShareButton({ personName, amount, restaurant, phone }: ShareButtonProps) {
  const message = `Hey ${personName}! You were billed RM${amount.toFixed(2)} for ${restaurant}. Pay me back: https://tngdigital.com.my/pay?to=DEMO`;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Payment Request from ${restaurant}`,
        text: message,
      });
    } else {
      window.open(waLink, '_blank');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        📤 Share Request
      </button>
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
      >
        📋 Copy
      </button>
    </div>
  );
}
