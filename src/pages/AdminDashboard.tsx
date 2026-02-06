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
              {/* Header with emoji */}
              <div className="text-center mb-8 fade-in-blur">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-h2" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                  Admin Dashboard
                </h1>
                <p className="text-body mt-3" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                  Enter your password to access analytics
                </p>
              </div>

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
                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    Login 🔓
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn-secondary w-full"
                  >
                    Back to Home
                  </button>
                </div>
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
        <div className="content-center" style={{ maxHeight: '85vh', overflowY: 'auto', width: '100%', padding: 'clamp(16px, 3vh, 24px)' }}>
          <SolidContainer>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="text-h2 flex items-center gap-3" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                  <span className="text-4xl">📊</span>
                  Analytics Dashboard
                </h1>
                <p className="text-body-small mt-2" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                  Real-time Valentine's Day statistics
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Home
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 fade-in">
                <strong>Error:</strong> {error}
              </div>
            )}

            {summary && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-in">
                  <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-md p-6 border-2 border-pink-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Total Valentines</h3>
                    <p className="text-5xl font-bold text-pink-600">{summary.total_valentines}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-md p-6 border-2 border-green-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Said YES 💚</h3>
                    <p className="text-5xl font-bold text-green-600">{summary.total_yes}</p>
                    <p className="text-sm text-gray-600 mt-2 font-medium">{summary.yes_rate_percentage}% success rate</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-md p-6 border-2 border-red-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Said NO 💔</h3>
                    <p className="text-5xl font-bold text-red-600">{summary.total_no}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-md p-6 border-2 border-yellow-100 hover:shadow-lg transition-shadow">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">Pending ⏳</h3>
                    <p className="text-5xl font-bold text-yellow-600">{summary.total_pending}</p>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border-2 border-gray-100 fade-in" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>📈</span> Engagement Metrics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Origin Views</p>
                      <p className="text-3xl font-bold text-gray-800">{summary.origin_views}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Receiver Opens</p>
                      <p className="text-3xl font-bold text-gray-800">{summary.receiver_opens}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Result Views</p>
                      <p className="text-3xl font-bold text-gray-800">{summary.result_views}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-600 text-sm font-semibold mb-2">Shares</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {summary.shares_triggered + summary.shares_fallback}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daily Stats */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-100 fade-in" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>📅</span> Daily Activity (Last 30 Days)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                          <th className="text-left py-4 px-4 text-gray-700 font-bold rounded-tl-lg">Date</th>
                          <th className="text-right py-4 px-4 text-gray-700 font-bold">Created</th>
                          <th className="text-right py-4 px-4 text-gray-700 font-bold">Yes</th>
                          <th className="text-right py-4 px-4 text-gray-700 font-bold">No</th>
                          <th className="text-right py-4 px-4 text-gray-700 font-bold rounded-tr-lg">Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyStats.map((stat, index) => (
                          <tr key={stat.date} className={`border-b border-gray-100 hover:bg-pink-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-4 px-4 font-medium text-gray-700">{new Date(stat.date).toLocaleDateString()}</td>
                            <td className="text-right py-4 px-4 font-bold text-gray-800">{stat.valentines_created}</td>
                            <td className="text-right py-4 px-4 font-bold text-green-600">{stat.yes_count}</td>
                            <td className="text-right py-4 px-4 font-bold text-red-600">{stat.no_count}</td>
                            <td className="text-right py-4 px-4 font-bold text-yellow-600">{stat.pending_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Refresh Info */}
                <div className="mt-8 text-center fade-in" style={{ animationDelay: '0.3s' }}>
                  <p className="text-gray-600 text-sm mb-3">
                    ⏱️ Dashboard auto-refreshes every 30 seconds
                  </p>
                  <button
                    onClick={fetchAnalytics}
                    className="text-pink-600 hover:text-pink-700 font-semibold underline transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : '🔄 Refresh now'}
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
