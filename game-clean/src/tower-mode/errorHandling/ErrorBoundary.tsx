import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TowerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)',
          color: '#e0e0ff',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#9888;&#65039;</div>
          <h2 style={{ color: '#ff6666', marginBottom: '0.5rem' }}>游戏遇到问题</h2>
          <p style={{ color: '#aaaacc', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.state.error?.message ?? '发生了未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #4466aa 0%, #2244aa 100%)',
              border: '2px solid #6688cc',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
