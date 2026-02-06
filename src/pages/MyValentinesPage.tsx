import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import RainingHearts from '../components/HeartParticles';
import { getStoredTokens, type StoredToken } from '../utils/resultTokenStorage';

export default function MyValentinesPage() {
    const navigate = useNavigate();
    const [tokens, setTokens] = useState<StoredToken[]>([]);

    useEffect(() => {
        const storedTokens = getStoredTokens();
        setTokens(storedTokens);
    }, []);

    if (tokens.length === 0) {
        return (
            <>
                <div className="liquid-gradient-bg" />
                <RainingHearts />
                <div className="scene-container">
                    <div className="content-center">
                        <GlassContainer>
                            <h1 className="text-h2 mb-8 fade-in-blur">
                                No Valentines Yet
                            </h1>
                            <p className="text-body-large mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                                You haven't sent any Valentines yet. Create one now!
                            </p>
                            <button onClick={() => navigate('/create')} className="btn-primary fade-in" style={{ animationDelay: '0.4s' }}>
                                Create Valentine
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
                    <h1 className="text-h2 mb-8 fade-in-blur">
                        My Valentines 💌
                    </h1>
                    <p className="text-body mb-12 fade-in" style={{ animationDelay: '0.2s' }}>
                        Click on any Valentine to see if they've answered
                    </p>

                    <div className="w-full max-w-md space-y-4 fade-in" style={{ animationDelay: '0.4s' }}>
                        {tokens.map((token, index) => (
                            <button
                                key={token.valentineId}
                                onClick={() => navigate(`/r/${token.token}`)}
                                className="w-full p-6 rounded-2xl border border-gray-200 hover:border-pink-300 transition-all text-left"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    backdropFilter: 'blur(8px)',
                                    animationDelay: `${0.4 + index * 0.1}s`,
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-body font-semibold mb-1">
                                            To: {token.receiverName}
                                        </p>
                                        <p className="text-body-small">
                                            Sent: {new Date(token.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-2xl">💌</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button onClick={() => navigate('/')} className="btn-secondary mt-8 fade-in" style={{ animationDelay: `${0.6 + tokens.length * 0.1}s` }}>
                        Go Home
                    </button>
                </GlassContainer>
                </div>
                <Footer />
            </div>
        </>
    );
}
