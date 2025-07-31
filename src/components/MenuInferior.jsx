// src/components/MenuInferior.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  WalletIcon,
  SettingsIcon,
  MenuIcon,
} from 'lucide-react'; // ou qualquer outro conjunto de ícones

export default function MenuInferior() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-neutral shadow-inner flex justify-around py-2 z-50">
      <button onClick={() => navigate('/dashboard')}>
        <HomeIcon className="w-6 h-6 text-primary" />
      </button>
      <button onClick={() => navigate('/transacoes')}>
        <WalletIcon className="w-6 h-6 text-primary" />
      </button>
      <button onClick={() => navigate('/configuracoes')}>
        <SettingsIcon className="w-6 h-6 text-primary" />
      </button>
      <button onClick={() => navigate('/mais')}>
        <MenuIcon className="w-6 h-6 text-primary" />
      </button>
    </nav>
  );
}

