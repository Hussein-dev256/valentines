import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import RainingHearts from '../components/HeartParticles';
import { getResult } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { celebrateYes } from '../utils/confetti';

export default function ResultsPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        loadResult();
    }, [token]);

    const loadResult = async () => {
        if (!token) return;

        try {
            const data = await getResult(token);
            setResult(data);
            trackEvent(EventTypes.RESULT_VIEWED, undefined, { token });
        } catch (error) {
            console.error('Error loading result:', error);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReveal = () => {
        setRevealed(true);
        if (result?.status === 'yes') {
            celebrateYes();
        }
    };

    if (loading) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <p className="text-body-large">Loading...</p>
                        </GlassContainer>
                    </div>
                </div>
            </>
        );
    }

    if (!result) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h2 className="text-h2 mb-4">Invalid result token</h2>
                            <p className="text-body mb-8">This result link is invalid or has expired.</p>
                            <button onClick={() => navigate('/')} className="btn-primary">
                                Go Home
                            </button>
                        </GlassContainer>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    if (result.status === 'pending') {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h1 className="text-hero mb-8 fade-in-blur">
                                Still Waiting... ⏳
                            </h1>
                            <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                They haven't answered yet. Check back later!
                            </p>
                            <button onClick={() => navigate('/')} className="btn-primary fade-in" style={{ animationDelay: '0.4s' }}>
                                Go Home
                            </button>
                        </GlassContainer>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    if (!revealed) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h1 className="text-hero mb-8 fade-in-blur">
                                The Moment of Truth 👀
                            </h1>
                            <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                Are you ready to see their response?
                            </p>
                            <button onClick={handleReveal} className="btn-primary fade-in" style={{ animationDelay: '0.4s' }}>
                                Show Me The Result
                            </button>
                        </GlassContainer>
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
                <div className="content-center">
                    <GlassContainer>
                    {result.status === 'yes' ? (
                        <>
                            <h1 className="text-hero mb-8 fade-in-blur">
                                They Said YES! 🎉
                            </h1>
                            <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                Congratulations! Time to plan that date 💖
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-hero mb-8 fade-in-blur">
                                Not This Time 😔
                            </h1>
                            <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                Don't worry, it takes courage to ask! There are plenty of fish in the sea 🐠
                            </p>
                        </>
                    )}
                    <button onClick={() => navigate('/create')} className="btn-primary fade-in" style={{ animationDelay: '0.4s' }}>
                        Ask Someone Else
                    </button>
                </GlassContainer>
                </div>
                <Footer />
            </div>
        </>
    );
}
