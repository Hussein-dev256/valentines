import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent, EventTypes } from '../services/analytics.service';

export default function OriginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent(EventTypes.ORIGIN_VIEW);
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
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-600 text-sm">
        <p>Made with ❤️ by a digital wingman</p>
      </footer>
    </div>
  );
}
