import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import GlassContainer from '../components/GlassContainer';
import GlassInput from '../components/GlassInput';
import RainingHearts from '../components/HeartParticles';
import { createValentine } from '../services/valentine.service';
import { trackEvent, EventTypes } from '../services/analytics.service';
import { storeResultToken } from '../utils/resultTokenStorage';

export default function CreateValentinePage() {
    const navigate = useNavigate();
    const [senderName, setSenderName] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!receiverName.trim()) {
            setError('Please enter the receiver\'s name');
            return;
        }

        setLoading(true);

        try {
            const result = await createValentine(
                senderName.trim() || null,
                receiverName.trim()
            );

            // Store result token for later access
            storeResultToken(
                result.valentine_id,
                result.result_url.split('/r/')[1],
                receiverName.trim()
            );

            trackEvent(EventTypes.VALENTINE_CREATED, result.valentine_id);

            // Navigate to prompt page
            navigate(`/created/${result.valentine_id}`, {
                state: {
                    publicUrl: result.public_url,
                    resultUrl: result.result_url,
                },
            });
        } catch (err) {
            console.error('Error creating valentine:', err);
            setError('Failed to create Valentine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="liquid-gradient-bg" />
            <RainingHearts />

            <div className="scene-container">
                <div className="content-center">
                    <GlassContainer>
                    <h1 className="text-h2 mb-8 fade-in-blur">
                        Create Your Valentine 💘
                    </h1>

                    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 fade-in" style={{ animationDelay: '0.2s' }}>
                        <GlassInput
                            type="text"
                            id="senderName"
                            name="senderName"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Anonymous"
                            label="Your Name (Optional)"
                        />

                        <GlassInput
                            type="text"
                            id="receiverName"
                            name="receiverName"
                            value={receiverName}
                            onChange={(e) => setReceiverName(e.target.value)}
                            placeholder="Enter their name"
                            label="Their Name"
                            required
                            error={error}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Creating...' : 'Create Valentine'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn-secondary w-full"
                        >
                            Cancel
                        </button>
                    </form>
                </GlassContainer>
                </div>

                <Footer />
            </div>
        </>
    );
}
