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
                        {/* Success Confirmation */}
                        <div className="text-center mb-10 fade-in-blur">
                            <div className="text-6xl mb-4">💌</div>
                            <h1 className="text-h2 mb-3" style={{ color: 'rgba(0, 0, 0, 0.9)', whiteSpace: 'nowrap' }}>
                                Valentine Created!
                            </h1>
                            <p className="text-body" style={{ color: 'rgba(0, 0, 0, 0.55)' }}>
                                Your special message is ready to share
                            </p>
                        </div>

                        {/* PRIMARY CTA - Share Interface */}
                        <div className="w-full max-w-md mb-12 fade-in" style={{ animationDelay: '0.3s' }}>
                            <ShareInterface 
                                url={publicUrl} 
                                receiverName={receiverName}
                            />
                        </div>

                        {/* SECONDARY CTA - Results Check */}
                        <div className="text-center mb-8 fade-in" style={{ animationDelay: '0.5s' }}>
                            <p className="text-body mb-6" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                Do you want to see if they've answered?
                            </p>
                        </div>

                        <div className="button-row-mobile fade-in" style={{ animationDelay: '0.6s' }}>
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
