import './Toast.scss';

import { memo, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
};

export const Toast = memo(function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{getIcon()}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
});
