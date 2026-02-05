import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Footer } from '../components';

interface AnalyticsSummary {
  total_valentines: number;
  total_yes: number;
  total_no: number;
  total_pending: number;
  origin_views: number;
  valentines_created_events: number;
  receiver_opens: number;
  yes_answers: number;
  no_answers: number;
  result_views: number;
  shares_triggered: number;
  shares_fallback: number;
  yes_rate_percentage: number;
  unique_valentines_with_activity: number;
  first_valentine_date: string | null;
  last_valentine_date: string | null;
}

interface DailyStat {
  date: string;
  valentines_created: number;
  yes_count: number;
  no_count: number;
  pending_count: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin password - use environment variable or fallback to default
  // IMPORTANT: Change this before deploying to production!
  // Recommended: Set VITE_ADMIN_PASSWORD in your .env.local and Vercel environment variables
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'valentine2025';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(null);
      fetchAnalytics();
    } else {
      setError('Invalid password');
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (summaryError) throw summaryError;
      setSummary(summaryData);

      // Fetch daily stats (last 30 days)
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_stats')
        .select('*')
        .limit(30);

      if (dailyError) throw dailyError;
      setDailyStats(dailyData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
      // Refresh every 30 seconds
      const interval = setInterval(fetchAnalytics, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
              Admin Dashboard 🔒
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-gray-600 hover:text-gray-800 underline text-sm"
              >
                Back to home
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
        <div className="text-pink-600 text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col">
      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-pink-600">
              Analytics Dashboard 📊
            </h1>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-full transition-colors duration-200"
            >
              Home
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {summary && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Valentines</h3>
                  <p className="text-4xl font-bold text-pink-600">{summary.total_valentines}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Said YES 💚</h3>
                  <p className="text-4xl font-bold text-green-600">{summary.total_yes}</p>
                  <p className="text-sm text-gray-500 mt-1">{summary.yes_rate_percentage}% success rate</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Said NO 💔</h3>
                  <p className="text-4xl font-bold text-red-600">{summary.total_no}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending ⏳</h3>
                  <p className="text-4xl font-bold text-yellow-600">{summary.total_pending}</p>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Engagement Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Origin Views</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.origin_views}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Receiver Opens</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.receiver_opens}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Result Views</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.result_views}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Shares</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.shares_triggered + summary.shares_fallback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Activity (Last 30 Days)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Created</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Yes</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">No</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyStats.map((stat) => (
                        <tr key={stat.date} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(stat.date).toLocaleDateString()}</td>
                          <td className="text-right py-3 px-4 font-semibold">{stat.valentines_created}</td>
                          <td className="text-right py-3 px-4 text-green-600">{stat.yes_count}</td>
                          <td className="text-right py-3 px-4 text-red-600">{stat.no_count}</td>
                          <td className="text-right py-3 px-4 text-yellow-600">{stat.pending_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Refresh Info */}
              <div className="mt-6 text-center text-gray-600 text-sm">
                <p>Dashboard auto-refreshes every 30 seconds</p>
                <button
                  onClick={fetchAnalytics}
                  className="mt-2 text-pink-600 hover:text-pink-700 underline"
                >
                  Refresh now
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
