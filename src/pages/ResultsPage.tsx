import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import RainingHearts from '../components/HeartParticles';
import { getValentineBySenderToken } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { celebrateYes } from '../utils/confetti';

export default function ResultsPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        loadResult();
    }, [token]);

    const loadResult = async () => {
        if (!token) return;

        try {
            // Look up valentine by sender_token
            // If someone has this token, they are the sender by definition
            const data = await getValentineBySenderToken(token);
            setResult(data);
            trackEvent(EventTypes.RESULT_VIEWED, data.valentine_id);
        } catch (error) {
            console.error('Error loading result:', error);
            setNotFound(true);
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

    if (notFound || !result) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h2 className="text-h2 mb-4">Invalid Link 🚫</h2>
                            <p className="text-body mb-8">This results link is invalid or has expired.</p>
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
                            <h1 className="text-hero mb-8 fade-in-blur" style={{ whiteSpace: 'nowrap' }}>
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
                            <h1 className="text-hero mb-8 fade-in-blur" style={{ whiteSpace: 'nowrap' }}>
                                WAIT ✋😬
                            </h1>
                            <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                Are you REALLY sure you wanna know?? 😭😂
                            </p>
                            <div className="button-row-mobile fade-in" style={{ animationDelay: '0.4s' }}>
                                <button onClick={handleReveal} className="btn-primary">
                                    Yes… tell me 😭
                                </button>
                                <button onClick={() => navigate('/')} className="btn-secondary">
                                    No no no 😅
                                </button>
                            </div>
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
                                <h1 className="text-hero mb-4 fade-in-blur" style={{ whiteSpace: 'nowrap' }}>
                                    GOOD NEWS 🎉💖
                                </h1>
                                <h1 className="text-hero mb-8 fade-in-blur" style={{ animationDelay: '0.2s', whiteSpace: 'nowrap' }}>
                                    THEY SAID YESSS 😍😍
                                </h1>
                                <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.4s' }}>
                                    Go and behave yourself now 😌
                                </p>
                                <button onClick={() => navigate('/create')} className="btn-primary fade-in" style={{ animationDelay: '0.6s' }}>
                                    Ask another person out 💘, I won't spill I promise 😉
                                </button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-hero mb-4 fade-in-blur" style={{ whiteSpace: 'nowrap' }}>
                                    Hmm… 😬😬
                                </h1>
                                <p className="text-body-large mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
                                    This one hurts small sha…
                                </p>
                                <h1 className="text-hero mb-8 fade-in-blur" style={{ animationDelay: '0.4s', whiteSpace: 'nowrap' }}>
                                    They said NO 😭💔
                                </h1>
                                <h2 className="text-h2 mb-4 fade-in" style={{ animationDelay: '0.6s', whiteSpace: 'nowrap' }}>
                                    BUT HEY 😌
                                </h2>
                                <p className="text-body-large mb-4 fade-in" style={{ animationDelay: '0.8s' }}>
                                    There's plenty of fish in the sea...😏
                                </p>
                                <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '1s' }}>
                                    Go try again.
                                </p>
                                <button onClick={() => navigate('/create')} className="btn-primary fade-in" style={{ animationDelay: '1.2s' }}>
                                    Ask another person out 💘
                                </button>
                            </>
                        )}
                    </GlassContainer>
                </div>
                <Footer />
            </div>
        </>
    );
}
