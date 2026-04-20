import { useCallback, useState } from 'react';
import type { ErrorInfo } from 'react';
import { TowerErrorBoundary } from './errorHandling/ErrorBoundary';
import { TowerModeApp } from './TowerModeApp';

export interface GameOverResult {
  reason: string;
  layer: number;
  battlesWon: number;
  technicalValue: number;
}

export interface TowerModeGameProps {
  onGameOver?: (result: GameOverResult) => void;
  onVictory?: () => void;
  onSave?: (saveData: unknown) => void;
}

export function TowerModeGame({ onGameOver, onVictory, onSave }: TowerModeGameProps) {
  const [retryKey, setRetryKey] = useState(0);

  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error('[TowerModeGame] Error caught by boundary:', error, errorInfo);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  const handleSaveExit = useCallback(() => {
    onSave?.(null);
  }, [onSave]);

  return (
    <TowerErrorBoundary onError={handleError} onRetry={handleRetry}>
      <TowerModeApp
        key={retryKey}
        onSaveExit={handleSaveExit}
      />
    </TowerErrorBoundary>
  );
}
