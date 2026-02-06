import { Component, type ErrorInfo, type ReactNode } from 'react';
import GlassContainer from './GlassContainer';
import RainingHearts from './HeartParticles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="liquid-gradient-bg" />
          <RainingHearts />
          <div className="scene-container">
            <div className="content-center">
              <GlassContainer>
                <h1 className="text-hero mb-8">Oops! 😅</h1>
                <p className="text-body-large mb-8">
                  Something went wrong. Please refresh the page and try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Refresh Page
                </button>
              </GlassContainer>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
