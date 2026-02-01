
import React, { useState, useRef, useEffect } from 'react';

interface AdminAuthModalProps {
  validPins: string[];
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ validPins, onClose, onSuccess, title = "Autorización Requerida" }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input when the modal opens
    inputRef.current?.focus();
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validPins.includes(pin)) {
      onSuccess();
    } else {
      setError('PIN incorrecto. Intente de nuevo.');
      setPin(''); // Clear input on error
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[200] p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-bold text-gray-900 mt-4" id="modal-title">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Esta acción requiere un PIN de administrador para continuar.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-pin" className="sr-only">
              PIN de Administrador
            </label>
            <input
              ref={inputRef}
              id="admin-pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={handlePinChange}
              className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] font-bold text-gray-900 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] transition"
              placeholder="••••"
              maxLength={4}
              autoComplete="off"
            />
            {error && <p className="mt-2 text-sm text-center text-red-600">{error}</p>}
          </div>
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[var(--brand-color)] text-base font-medium text-white hover:bg-[var(--brand-color-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-color)] sm:w-auto sm:text-sm disabled:bg-gray-400"
            >
              Autorizar
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthModal;
