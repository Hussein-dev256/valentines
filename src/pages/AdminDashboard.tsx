import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Footer, SolidContainer, SolidInput } from '../components';
import RainingHearts from '../components/HeartParticles';

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

  // Debug: Log the password being used (remove this in production!)
  console.log('Admin password check:', ADMIN_PASSWORD === 'valentine2025' ? 'Using default password' : 'Using custom password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with password length:', password.length);
    console.log('Expected password length:', ADMIN_PASSWORD.length);
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(null);
      fetchAnalytics();
    } else {
      setError('Invalid password');
      console.log('Password mismatch');
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
      <>
        {/* Pink gradient background */}
        <div className="liquid-gradient-bg" />
        
        {/* Raining hearts */}
        <RainingHearts />
        
        <div className="scene-container">
          <div className="content-center">
            <SolidContainer>
              <h1 className="text-h2 mb-8 fade-in-blur" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                Admin Dashboard 🔒
              </h1>
              <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 fade-in" style={{ animationDelay: '0.2s' }}>
                <SolidInput
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  label="Password"
                  required
                  error={error || undefined}
                />
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary w-full"
                >
                  Back to home
                </button>
              </form>
            </SolidContainer>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (loading && !summary) {
    return (
      <>
        <div className="liquid-gradient-bg" />
        <RainingHearts />
        <div className="scene-container">
          <div className="content-center">
            <SolidContainer>
              <div className="text-h3" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>Loading analytics...</div>
            </SolidContainer>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="liquid-gradient-bg" />
      <RainingHearts />
      
      <div className="scene-container">
        <div className="content-center" style={{ maxHeight: '85vh', overflowY: 'auto', width: '100%' }}>
          <SolidContainer>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-h2" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                Analytics Dashboard 📊
              </h1>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
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
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Valentines</h3>
                    <p className="text-4xl font-bold text-pink-600">{summary.total_valentines}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Said YES 💚</h3>
                    <p className="text-4xl font-bold text-green-600">{summary.total_yes}</p>
                    <p className="text-sm text-gray-500 mt-1">{summary.yes_rate_percentage}% success rate</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Said NO 💔</h3>
                    <p className="text-4xl font-bold text-red-600">{summary.total_no}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending ⏳</h3>
                    <p className="text-4xl font-bold text-yellow-600">{summary.total_pending}</p>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
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
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
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
          </SolidContainer>
        </div>
        <Footer />
      </div>
    </>
  );
}
