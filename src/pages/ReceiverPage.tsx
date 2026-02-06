import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import GlossyHeart from '../components/GlossyHeart';
import RainingHearts from '../components/HeartParticles';
import DodgingButton from '../components/DodgingButton';
import { getValentine, submitAnswer } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { celebrateYes } from '../utils/confetti';
import { isSender, getResultTokenByValentineId } from '../utils/resultTokenStorage';

export default function ReceiverPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [valentine, setValentine] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answered, setAnswered] = useState(false);
    const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

    useEffect(() => {
        loadValentine();
    }, [id]);

    const loadValentine = async () => {
        if (!id) return;

        try {
            // Check if user is the sender - redirect to results page
            if (isSender(id)) {
                const resultToken = getResultTokenByValentineId(id);
                if (resultToken) {
                    navigate(`/r/${resultToken}`, { replace: true });
                    return;
                }
            }

            const data = await getValentine(id);
            setValentine(data);

            // Check if already answered
            if (data.status !== 'pending') {
                setAnswered(true);
                setAnswer(data.status as 'yes' | 'no');
            }

            trackEvent(EventTypes.RECEIVER_OPENED, id);
        } catch (error) {
            console.error('Error loading valentine:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (response: 'yes' | 'no') => {
        if (!id || answered) return;

        try {
            await submitAnswer(id, response);
            setAnswered(true);
            setAnswer(response);

            if (response === 'yes') {
                celebrateYes();
            }

            trackEvent(
                response === 'yes' ? EventTypes.ANSWERED_YES : EventTypes.ANSWERED_NO,
                id
            );
        } catch (error) {
            console.error('Error answering valentine:', error);
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

                        {/* Action buttons - smaller, always horizontal for dodging gameplay */}
                        <div className="button-row-game fade-in" style={{ animationDelay: '0.8s' }}>
                            <button
                                onClick={() => handleAnswer('yes')}
                                className="btn-primary"
                            >
                                YES! 😍
                            </button>
                            <DodgingButton
                                onClick={() => handleAnswer('no')}
                                className="btn-secondary"
                                dodgeDuration={24000}
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
