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

    const MAX_NAME_LENGTH = 50;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!receiverName.trim()) {
            setError('Please enter the receiver\'s name');
            return;
        }

        if (receiverName.trim().length > MAX_NAME_LENGTH) {
            setError(`Receiver name must be ${MAX_NAME_LENGTH} characters or less`);
            return;
        }

        if (senderName && senderName.trim().length > MAX_NAME_LENGTH) {
            setError(`Sender name must be ${MAX_NAME_LENGTH} characters or less`);
            return;
        }

        setLoading(true);

        try {
            const result = await createValentine(
                senderName.trim() || null,
                receiverName.trim()
            );

            // Extract sender_token from sender_url for localStorage storage
            const senderToken = result.sender_url.split('/r/')[1];

            // Store result token for "My Valentines" page (convenience, not security)
            storeResultToken(
                senderToken,
                result.valentine_id,
                receiverName.trim()
            );

            trackEvent(EventTypes.VALENTINE_CREATED, result.valentine_id);

            // Navigate to prompt page with new URL structure
            navigate(`/created/${result.valentine_id}`, {
                state: {
                    receiverUrl: result.receiver_url,
                    senderUrl: result.sender_url,
                    receiverName: receiverName.trim(),
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
                        {/* Header with emoji */}
                        <div className="text-center mb-8 fade-in-blur">
                            <div className="text-6xl mb-4">💘</div>
                            <h1 className="text-h2" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                                Create Your Valentine
                            </h1>
                            <p className="text-body mt-3" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                Fill in the details below to create a special Valentine's message
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 fade-in" style={{ animationDelay: '0.2s' }}>
                            <GlassInput
                                type="text"
                                id="senderName"
                                name="senderName"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="Anonymous"
                                label="Your Name (Optional)"
                                maxLength={50}
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
                                maxLength={50}
                            />

                            <div className="pt-4 space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full"
                                    style={{
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'Creating... ✨' : 'Create Valentine 💖'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="btn-secondary w-full"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </GlassContainer>
                </div>

                <Footer />
            </div>
        </>
    );
}
