
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  businessName: string;
  businessLogo: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, businessName, businessLogo }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const verifyPin = (enteredPin: string) => {
    const user = users.find(u => u.pin === enteredPin);
    if (user) {
      onLogin(user);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop)' }}>

      {/* Logo y Nombre */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top duration-700">
        <div className="w-24 h-24 bg-white rounded-3xl p-3 mx-auto mb-4 shadow-2xl shadow-red-500/20">
          <img src={businessLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{businessName}</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Sistema POS v2.0</p>
      </div>

      {/* Indicadores de PIN */}
      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${error
                ? 'bg-red-500 border-red-500 animate-bounce'
                : pin.length > i
                  ? 'bg-red-500 border-red-500 scale-125 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-transparent border-white/20'
              }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full animate-in fade-in zoom-in duration-500 delay-200">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-20 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl text-2xl font-black text-white transition-all active:scale-95 flex items-center justify-center shadow-lg"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleKeyPress('0')}
          className="h-20 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl text-2xl font-black text-white transition-all active:scale-95 flex items-center justify-center shadow-lg"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-20 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 rounded-2xl text-red-500 transition-all active:scale-95 flex items-center justify-center shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 9" />
          </svg>
        </button>
      </div>

      <div className="mt-10 text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
        Introduce tu código de acceso para continuar
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-bounce {
          animation: bounce 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;