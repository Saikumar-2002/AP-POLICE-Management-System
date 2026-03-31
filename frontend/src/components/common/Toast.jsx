import React from 'react';
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiExclamation } from 'react-icons/hi';
import useUiStore from '../../store/uiStore';

const iconMap = {
  success: <HiCheckCircle />,
  error: <HiExclamationCircle />,
  warning: <HiExclamation />,
  info: <HiInformationCircle />,
};

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'info'}`}>
          <span className="toast-icon">{iconMap[toast.type] || iconMap.info}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-dismiss" onClick={() => removeToast(toast.id)}>
            <HiX />
          </button>
        </div>
      ))}
    </div>
  );
}
