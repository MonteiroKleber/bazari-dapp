import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HeaderSimples({ titulo, onVoltar }) {
  return (
    <header className="bg-primary text-white px-4 py-3 relative flex items-center justify-center">
      <button onClick={onVoltar} className="absolute left-4">
        <ArrowLeft />
      </button>
      <h1 className="text-lg font-bold text-center">{titulo}</h1>
    </header>
  );
}

