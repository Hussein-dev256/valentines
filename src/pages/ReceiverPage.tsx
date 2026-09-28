import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import GlossyHeart from '../components/GlossyHeart';
import RainingHearts from '../components/HeartParticles';
import DodgingButton from '../components/DodgingButton';
import { getValentineByReceiverToken, submitAnswerByReceiverToken, getReceiverTokenByValentineId } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { celebrateYes } from '../utils/confetti';

export default function ReceiverPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [valentine, setValentine] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answered, setAnswered] = useState(false);
    const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [notFound, setNotFound] = useState(false);
    // The actual receiver_token to use (may differ from URL param if old-format redirect)
    const [receiverToken, setReceiverToken] = useState<string | null>(null);

    useEffect(() => {
        loadValentine();
    }, [token]);

    const loadValentine = async () => {
        if (!token) return;

        try {
            // Try loading by receiver_token first (new format)
            let data = null;
            let activeToken = token;

            try {
                data = await getValentineByReceiverToken(token);
            } catch {
                // If not found, check if this is an old-format valentine ID
                const fallbackToken = await getReceiverTokenByValentineId(token);
                if (fallbackToken) {
                    // Redirect to the new URL format
                    navigate(`/v/${fallbackToken}`, { replace: true });
                    return;
                }
            }

            if (!data) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setReceiverToken(activeToken);
            setValentine(data);

            // Check if already answered
            if (data.status !== 'pending') {
                setAnswered(true);
                setAnswer(data.status as 'yes' | 'no');
            }

            trackEvent(EventTypes.RECEIVER_OPENED, data.valentine_id);
        } catch (error) {
            console.error('Error loading valentine:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (response: 'yes' | 'no') => {
        if (!receiverToken || answered || submitting) return;

        setSubmitting(true);
        try {
            await submitAnswerByReceiverToken(receiverToken, response);
            setAnswered(true);
            setAnswer(response);

            if (response === 'yes') {
                celebrateYes();
            }

            trackEvent(
                response === 'yes' ? EventTypes.ANSWERED_YES : EventTypes.ANSWERED_NO,
                valentine?.valentine_id
            );
        } catch (error) {
            console.error('Error answering valentine:', error);
            setSubmitting(false);
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

    if (notFound) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h2 className="text-h2 mb-4">Valentine Not Found</h2>
                            <p className="text-body mb-8">This Valentine doesn't exist or the link is invalid.</p>
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

    if (!valentine) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h2 className="text-h2 mb-4">Valentine Not Found</h2>
                            <p className="text-body">This Valentine doesn't exist or has been removed.</p>
                        </GlassContainer>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    if (answered) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            {answer === 'yes' ? (
                                <>
                                    <h1 className="text-hero mb-8 fade-in-blur" style={{ whiteSpace: 'nowrap' }}>
                                        AYYYYY 😍💃🕺
                                    </h1>
                                    <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                        You just made someone very happy 💖
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-hero mb-8 fade-in-blur" style={{ whiteSpace: 'nowrap' }}>
                                        Oouucchh...Got it 😌
                                    </h1>
                                    <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                        Thanks for being cold 💀
                                    </p>
                                </>
                            )}

                            <button
                                onClick={() => window.location.href = '/create'}
                                className="btn-primary fade-in"
                                style={{ animationDelay: '0.4s' }}
                            >
                                Ask another person out 💌
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
                        {/* Receiver name */}
                        <h2 className="text-h2 mb-4 fade-in">
                            {valentine.receiver_name},
                        </h2>

                        {/* Main question with glossy heart */}
                        <div style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
                            <h1 className="text-valentine-iconic mb-2 fade-in-blur" style={{ animationDelay: '0.2s' }}>
                                WILL Y<GlossyHeart />U
                            </h1>
                        </div>
                        <h1 className="text-valentine-iconic mb-2 fade-in-blur" style={{ animationDelay: '0.3s', whiteSpace: 'nowrap' }}>
                            BE MY
                        </h1>
                        <h1 className="text-valentine-iconic mb-8 fade-in-blur" style={{ animationDelay: '0.4s', whiteSpace: 'nowrap' }}>
                            VALENTINE?
                        </h1>

                        {/* From sender */}
                        <p className="text-body-large mb-8 fade-in" style={{ animationDelay: '0.6s' }}>
                            From: <strong>{valentine.sender_name}</strong>
                        </p>

                        {/* Action buttons */}
                        <div className="button-row-game fade-in" style={{ animationDelay: '0.8s' }}>
                            <button
                                onClick={() => handleAnswer('yes')}
                                className="btn-primary"
                                disabled={submitting}
                            >
                                YES! 😍
                            </button>
                            <DodgingButton
                                onClick={() => handleAnswer('no')}
                                className="btn-secondary"
                                dodgeDuration={24000}
                                disabled={submitting}
                            >
                                NO 🙃
                            </DodgingButton>
                        </div>
                    </GlassContainer>
                </div>

                <Footer />
            </div>
        </>
    );
}
