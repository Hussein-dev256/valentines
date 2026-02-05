import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResult } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import type { GetResultResponse } from '../types/database.types';

export default function ResultsPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<GetResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!token) {
        setError('Invalid result link');
        setLoading(false);
        return;
      }

      try {
        const data = await getResult(token);
        setResult(data);
        trackEvent(EventTypes.RESULT_VIEWED);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
        <div className="text-pink-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
            <p className="text-gray-700 mb-6">{error || 'Result not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show warning screen before revealing result
  if (showWarning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-pink-600 mb-6">
              The Moment of Truth 🎭
            </h1>
            <p className="text-gray-700 mb-8">
              Are you ready to see if they said yes?
            </p>
            
            <button
              onClick={() => setShowWarning(false)}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
            >
              Show Me The Result
            </button>
          </div>
        </main>
        
        <footer className="py-6 text-center text-gray-600 text-sm">
          <p>Made with ❤️ by a digital wingman</p>
        </footer>
      </div>
    );
  }

  // Show result based on status
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          {result.status === 'pending' && (
            <>
              <h1 className="text-3xl font-bold text-gray-700 mb-6">
                Still Waiting... ⏳
              </h1>
              <p className="text-gray-700 mb-8 text-lg">
                They haven't answered yet! Keep your fingers crossed 🤞
              </p>
              <p className="text-gray-600 mb-8 text-sm">
                Check back later to see their response!
              </p>
            </>
          )}

          {result.status === 'yes' && (
            <>
              <h1 className="text-4xl font-bold text-green-600 mb-6">
                They Said YES! 🎉💚
              </h1>
              <p className="text-gray-700 mb-8 text-lg">
                Congratulations! Time to plan that perfect Valentine's date! 💕
              </p>
            </>
          )}

          {result.status === 'no' && (
            <>
              <h1 className="text-3xl font-bold text-gray-700 mb-6">
                Not This Time 💙
              </h1>
              <p className="text-gray-700 mb-8 text-lg">
                Hey, you took your shot and that takes courage! There are plenty of other fish in the sea 🐠
              </p>
              <p className="text-gray-600 mb-8">
                Keep your head up - the right person is out there!
              </p>
            </>
          )}
          
          <button
            onClick={() => navigate('/create')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
          >
            Create Another Valentine
          </button>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-600 text-sm">
        <p>Made with ❤️ by a digital wingman</p>
      </footer>
    </div>
  );
}
