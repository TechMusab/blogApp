import './ToastContainer.scss';

import { memo } from 'react';
import { Toast, type ToastType } from './Toast';
import type { RootState } from '../../../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../../redux/slices/toasts/toastsSlice';

export const ToastContainer = memo(function ToastContainer() {
  const toasts = useSelector((state: RootState) => state.toasts.items);
  const dispatch = useDispatch();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type as ToastType}
          duration={toast.duration}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
});
