import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResult } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { Footer } from '../components';
import { celebrateYes } from '../utils/confetti';
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
              WAIT ✋😬
            </h1>
            <p className="text-gray-700 mb-8 text-lg">
              Are you REALLY sure you wanna know?? 😭😂
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowWarning(false);
                  // Trigger confetti if result is YES
                  if (result?.status === 'yes') {
                    setTimeout(() => celebrateYes(), 500);
                  }
                }}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
              >
                Yes… tell me 😭
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-full transition-colors duration-200"
              >
                No no no 😅
              </button>
            </div>
          </div>
        </main>
        
        <Footer />
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
                GOOD NEWS 🎉💖
              </h1>
              <h2 className="text-3xl font-bold text-green-600 mb-6">
                THEY SAID YESSS 😍😍
              </h2>
              <p className="text-gray-700 mb-8 text-lg italic">
                Go and behave yourself now 😌
              </p>
            </>
          )}

          {result.status === 'no' && (
            <>
              <h1 className="text-3xl font-bold text-gray-700 mb-4">
                Hmm… 😬😬
              </h1>
              <p className="text-gray-600 mb-6 text-lg italic">
                This one hurts small sha…
              </p>
              <h2 className="text-3xl font-bold text-red-600 mb-6">
                They said NO 😭💔
              </h2>
              <div className="my-8 border-t-2 border-gray-200"></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                BUT HEY 😌
              </h3>
              <p className="text-gray-700 mb-4 text-lg">
                Valentine plenty outside 😏
              </p>
              <p className="text-gray-700 mb-8 text-lg">
                Go try again.
              </p>
            </>
          )}
          
          <button
            onClick={() => navigate('/create')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
          >
            Ask another person out 💘
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
