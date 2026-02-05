import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getValentine, submitAnswer } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { DodgingButton } from '../components';
import type { GetValentineResponse } from '../types/database.types';

export default function ReceiverPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [valentine, setValentine] = useState<GetValentineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const fetchValentine = async () => {
      if (!id) {
        setError('Invalid Valentine link');
        setLoading(false);
        return;
      }

      try {
        const data = await getValentine(id);
        setValentine(data);
        trackEvent(EventTypes.RECEIVER_OPENED, id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Valentine');
      } finally {
        setLoading(false);
      }
    };

    fetchValentine();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
        <div className="text-pink-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !valentine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
            <p className="text-gray-700 mb-6">{error || 'Valentine not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const senderDisplay = valentine.sender_name || 'Someone';

  const handleAnswer = async (selectedAnswer: 'yes' | 'no') => {
    if (!id || isSubmitting || hasAnswered) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitAnswer(id, selectedAnswer);
      setAnswer(selectedAnswer);
      setHasAnswered(true);
      
      // Track event
      trackEvent(
        selectedAnswer === 'yes' ? EventTypes.ANSWERED_YES : EventTypes.ANSWERED_NO,
        id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYesClick = () => handleAnswer('yes');
  const handleNoClick = () => handleAnswer('no');

  // Show feedback screen after answering
  if (hasAnswered && answer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            {answer === 'yes' ? (
              <>
                <h1 className="text-4xl font-bold text-green-600 mb-6">
                  AYYYYY 😍💃🕺
                </h1>
                <p className="text-gray-700 mb-8 text-lg">
                  You just made someone very happy 💖
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-700 mb-6">
                  All good! 👍
                </h1>
                <p className="text-gray-700 mb-8 text-lg">
                  No worries! There are plenty of fish in the sea. Maybe you'll find your Valentine another way! 🐠
                </p>
              </>
            )}
            
            <button
              onClick={() => navigate('/create')}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200"
            >
              Ask another person out 💌
            </button>
          </div>
        </main>
        
        <footer className="py-6 text-center text-gray-600 text-sm">
          <p>Made with ❤️ by a digital wingman</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-pink-600 mb-6">
            {valentine.receiver_name}, Will You Be My Valentine? 💕
          </h1>
          <p className="text-gray-700 mb-8 text-lg">
            From: {senderDisplay}
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleYesClick}
              disabled={isSubmitting}
              className="w-64 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'YES 😍'}
            </button>
            
            <DodgingButton
              onClick={handleNoClick}
              className="w-64 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-4 px-8 rounded-full text-lg"
            >
              NO 🙃
            </DodgingButton>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-600 text-sm">
        <p>Made with ❤️ by a digital wingman</p>
      </footer>
    </div>
  );
}
