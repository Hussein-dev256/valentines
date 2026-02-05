import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createValentine } from '../services/valentine.service';

export default function CreateValentinePage() {
  const navigate = useNavigate();
  const [receiverName, setReceiverName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate receiver name
    const trimmedReceiverName = receiverName.trim();
    if (!trimmedReceiverName) {
      setError('Please enter the receiver\'s name');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createValentine(
        senderName.trim() || null,
        trimmedReceiverName
      );

      // Trigger share interface
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Will You Be My Valentine?',
            text: `${trimmedReceiverName}, will you be my Valentine? 💕`,
            url: result.public_url,
          });
        } catch (shareError) {
          // User cancelled share or share failed, fallback to clipboard
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            await navigator.clipboard.writeText(result.public_url);
            alert('Link copied to clipboard!');
          }
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(result.public_url);
        alert('Link copied to clipboard! Share it with your Valentine 💕');
      }

      // Navigate to result page
      const resultToken = result.result_url.split('/r/')[1];
      navigate(`/r/${resultToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Valentine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
            Create Your Valentine 💌
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="receiverName" className="block text-gray-700 font-semibold mb-2">
                Who's the lucky person? *
              </label>
              <input
                type="text"
                id="receiverName"
                name="receiverName"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Their name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="senderName" className="block text-gray-700 font-semibold mb-2">
                Your name (optional but encouraged)
              </label>
              <input
                type="text"
                id="senderName"
                name="senderName"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Leave blank to stay mysterious"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Ask them out 😈💌'}
            </button>
          </form>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-600 text-sm">
        <p>Made with ❤️ by a digital wingman</p>
      </footer>
    </div>
  );
}
