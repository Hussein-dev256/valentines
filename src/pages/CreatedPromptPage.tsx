import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import RainingHearts from '../components/HeartParticles';
import ShareInterface from '../components/ShareInterface';

export default function CreatedPromptPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { publicUrl, resultUrl } = location.state || {};

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
                    <h1 className="text-h2 mb-8 fade-in-blur">
                        Valentine Created! 💌
                    </h1>

                    <p className="text-body-large mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
                        Share this link with them:
                    </p>

                    <div className="w-full max-w-md mb-12 fade-in" style={{ animationDelay: '0.4s' }}>
                        <ShareInterface url={publicUrl} />
                    </div>

                    <p className="text-body mb-8 fade-in" style={{ animationDelay: '0.6s' }}>
                        Do you want to see if they've answered?
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in" style={{ animationDelay: '0.8s' }}>
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
