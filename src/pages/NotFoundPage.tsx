import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-6xl font-bold text-pink-600 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! This Valentine Doesn't Exist 💔
          </h2>
          <p className="text-gray-700 mb-8">
            Looks like this link got lost in the shuffle. Maybe it's time to create your own Valentine?
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate('/create')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-full transition-colors duration-200"
            >
              Create a Valentine
            </button>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-600 text-sm">
        <p>Made with ❤️ by a digital wingman</p>
      </footer>
    </div>
  );
}
