import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import RainingHearts from '../components/HeartParticles';
import ShareInterface from '../components/ShareInterface';

export default function CreatedPromptPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { publicUrl, resultUrl, receiverName } = location.state || {};

    if (!publicUrl || !resultUrl) {
        navigate('/');
        return null;
    }

    const handleViewResults = () => {
        const token = resultUrl.split('/r/')[1];
        navigate(`/r/${token}`);
    };

    const handleMaybeLater = () => {
        navigate('/');
    };

    return (
        <>
            <div className="liquid-gradient-bg" />
            <RainingHearts />

            <div className="scene-container">
                <div className="content-center">
                    <GlassContainer>
                        {/* Header with emoji */}
                        <div className="text-center mb-8 fade-in-blur">
                            <div className="text-6xl mb-4">💌</div>
                            <h1 className="text-h2" style={{ color: 'rgba(0, 0, 0, 0.9)', whiteSpace: 'nowrap' }}>
                                Valentine Created!
                            </h1>
                            <p className="text-body mt-3" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                Your special message is ready to share
                            </p>
                        </div>

                        <p className="text-body-large mb-6 fade-in text-center" style={{ animationDelay: '0.2s', color: 'rgba(0, 0, 0, 0.8)' }}>
                            Share this link with them:
                        </p>

                        <div className="w-full max-w-md mb-10 fade-in" style={{ animationDelay: '0.4s' }}>
                            <ShareInterface 
                                url={publicUrl} 
                                receiverName={receiverName}
                            />
                        </div>

                        <p className="text-body mb-8 fade-in text-center" style={{ animationDelay: '0.6s', color: 'rgba(0, 0, 0, 0.7)' }}>
                            Do you want to see if they've answered?
                        </p>

                        <div className="button-row-mobile fade-in" style={{ animationDelay: '0.8s' }}>
                            <button onClick={handleViewResults} className="btn-primary">
                                Yes, show me! 👀
                            </button>
                            <button onClick={handleMaybeLater} className="btn-secondary">
                                Maybe later 😌
                            </button>
                        </div>
                    </GlassContainer>
                </div>

                <Footer />
            </div>
        </>
    );
}
