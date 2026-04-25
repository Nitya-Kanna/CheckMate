import { useState } from 'react';

interface NLPSplitProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export default function NLPSplit({ onSubmit, isLoading }: NLPSplitProps) {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
      <h2 className="text-lg font-bold mb-2">✨ AI Split</h2>
      <p className="text-sm text-gray-600 mb-3">Or just tell us who had what:</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='e.g. "Calvin had nasi lemak and teh ice, Jet had iced coffee, rojak shared between Calvin and Jet"'
        className="w-full px-3 py-2 border rounded-lg h-24 resize-none"
      />
      <button
        onClick={() => onSubmit(prompt)}
        disabled={isLoading || !prompt.trim()}
        className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
      >
        {isLoading ? 'Splitting...' : '✨ AI Split'}
      </button>
    </div>
  );
}
