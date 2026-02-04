import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Потвърди',
    cancelText: 'Отказ',
    type: 'warning', // warning, danger, info
    onConfirm: null,
    onCancel: null,
  });

  const confirm = useCallback(({ title, message, confirmText, cancelText, type = 'warning' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: title || 'Потвърждение',
        message,
        confirmText: confirmText || 'Потвърди',
        cancelText: cancelText || 'Отказ',
        type,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      confirmState.onCancel?.();
    }
  };

  const getIcon = () => {
    switch (confirmState.type) {
      case 'danger':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
      default: // warning
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && (
        <div className="confirm-overlay" onClick={handleOverlayClick}>
          <div className={`confirm-dialog confirm-${confirmState.type}`}>
            <div className="confirm-icon">
              {getIcon()}
            </div>
            <div className="confirm-content">
              <h3 className="confirm-title">{confirmState.title}</h3>
              <p className="confirm-message">{confirmState.message}</p>
            </div>
            <div className="confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={confirmState.onCancel}
              >
                {confirmState.cancelText}
              </button>
              <button
                className={`btn ${confirmState.type === 'danger' ? 'btn-danger-solid' : 'btn-primary'}`}
                onClick={confirmState.onConfirm}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
