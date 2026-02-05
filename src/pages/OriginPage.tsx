import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { getStoredTokens } from '../utils/resultTokenStorage';

export default function OriginPage() {
  const navigate = useNavigate();
  const [hasSentValentines, setHasSentValentines] = useState(false);

  useEffect(() => {
    trackEvent(EventTypes.ORIGIN_VIEW);
    
    // Check if user has sent any Valentines
    const tokens = getStoredTokens();
    setHasSentValentines(tokens.length > 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">
            💘 Will You Be My Valentine?
          </h1>
          <p className="text-gray-700 mb-4 text-xl italic">
            Eyeing someone for Valentine's? 😏
          </p>
          <p className="text-gray-600 mb-8 text-lg">
            Ask them out.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-full transition-colors duration-200 text-lg"
          >
            Ask him / her out 💘
          </button>
          
          {hasSentValentines && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/my-valentines')}
                className="text-pink-600 hover:text-pink-700 underline text-sm"
              >
                View my sent Valentines
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
