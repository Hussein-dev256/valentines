import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredTokens } from '../utils/resultTokenStorage';
import { Footer } from '../components';

export default function MyValentinesPage() {
  const navigate = useNavigate();
  const [valentines, setValentines] = useState<Array<{
    token: string;
    receiverName: string;
    createdAt: string;
  }>>([]);

  useEffect(() => {
    const tokens = getStoredTokens();
    setValentines(tokens);
  }, []);

  if (valentines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-pink-600 mb-6">
              My Valentines 💌
            </h1>
            <p className="text-gray-700 mb-8 text-lg">
              You haven't sent any Valentines yet!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
            >
              Send your first Valentine 💘
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
            My Valentines 💌
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Click on any Valentine to see if they've answered
          </p>
          
          <div className="space-y-4">
            {valentines.map((valentine) => (
              <button
                key={valentine.token}
                onClick={() => navigate(`/r/${valentine.token}`)}
                className="w-full bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-lg p-4 transition-colors duration-200 text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      To: {valentine.receiverName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Sent: {new Date(valentine.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-pink-500 text-2xl">
                    💘
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => navigate('/create')}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
            >
              Send another Valentine 💌
            </button>
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 underline text-sm"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
