import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import GlossyHeart from '../components/GlossyHeart';
import RainingHearts from '../components/HeartParticles';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { getStoredTokens } from '../utils/resultTokenStorage';

export default function OriginPage() {
    const navigate = useNavigate();
    const [hasSentValentines, setHasSentValentines] = useState(false);

    useEffect(() => {
        trackEvent(EventTypes.ORIGIN_VIEW);

        // Check if user has sent any Valentines
        const tokens = getStoredTokens();
        setHasSentValentines(tokens.length > 0);
    }, []);

    return (
        <>
            {/* Pink gradient background */}
            <div className="liquid-gradient-bg" />
            
            {/* Raining hearts */}
            <RainingHearts />
            
            <div className="scene-container">
                <div className="content-center">
                    <GlassContainer>
                        {/* Hero text with glossy heart */}
                        <div className="mb-responsive-lg">
                            <h1 className="text-valentine-header fade-in-blur">
                                WILL Y<GlossyHeart />U BE MY
                            </h1>
                            <h1 className="text-valentine-script fade-in-blur" style={{ animationDelay: '0.2s' }}>
                                Valentine?
                            </h1>
                        </div>

                        {/* Text above CTA button */}
                        <p className="text-body fade-in" style={{ animationDelay: '0.4s', color: 'rgba(0, 0, 0, 0.6)', marginBottom: 'clamp(12px, 2vh, 16px)' }}>
                            Got your eyes on someone, don't be shy... 😏
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={() => navigate('/create')}
                            className="btn-primary fade-in"
                            style={{ animationDelay: '0.5s' }}
                        >
                            Ask them out
                        </button>

                        {/* Secondary link */}
                        {hasSentValentines && (
                            <div className="mt-responsive fade-in" style={{ animationDelay: '0.6s' }}>
                                <button
                                    onClick={() => navigate('/my-valentines')}
                                    className="text-body-small hover:underline"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0, 0, 0, 0.6)' }}
                                >
                                    View my sent Valentines
                                </button>
                            </div>
                        )}
                    </GlassContainer>
                </div>

                <Footer />
            </div>
        </>
    );
}
