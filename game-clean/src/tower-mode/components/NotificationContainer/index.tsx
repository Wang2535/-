import React, { useEffect } from 'react';
import type { Notification } from '../../types/integrator.types';

interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 200,
      pointerEvents: 'none',
      maxWidth: '320px',
    }}>
      {notifications.map((notification) => {
        const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
          info: { bg: 'rgba(68, 170, 255, 0.15)', border: '#4488ff', icon: 'ℹ️' },
          warning: { bg: 'rgba(255, 170, 68, 0.15)', border: '#ffaa44', icon: '⚠️' },
          success: { bg: 'rgba(68, 255, 136, 0.15)', border: '#44ff88', icon: '✅' },
          error: { bg: 'rgba(255, 68, 68, 0.15)', border: '#ff4444', icon: '❌' },
        };
        const style = typeStyles[notification.type] ?? typeStyles.info;

        return (
          <NotificationItem
            key={notification.id}
            notification={notification}
            style={style}
            onDismiss={onDismiss}
          />
        );
      })}
    </div>
  );
}

function NotificationItem({
  notification,
  style,
  onDismiss,
}: {
  notification: Notification;
  style: { bg: string; border: string; icon: string };
  onDismiss?: (id: string) => void;
}) {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.(notification.id);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onDismiss]);

  return (
    <div
      onClick={() => onDismiss?.(notification.id)}
      style={{
        padding: '0.6rem 1rem',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '8px',
        color: '#e0e0ff',
        fontSize: '0.85rem',
        fontFamily: 'monospace',
        pointerEvents: 'auto',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'slideIn 0.3s ease',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span>{style.icon}</span>
      <span>{notification.message}</span>
    </div>
  );
}
