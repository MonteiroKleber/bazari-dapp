// src/components/Header.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Header({ userName = 'Cidadão Bazari', onLogout }) {
  const { t } = useTranslation();

  return (
    <header className="w-full bg-primary text-white px-4 py-3 flex items-center justify-between font-nunito shadow">
      <h1 className="text-xl font-bold">{userName}</h1>
      <button
        onClick={onLogout}
        className="bg-white text-primary px-3 py-1 rounded font-semibold hover:bg-red-100 transition"
      >
        {t('common.logout')}
      </button>
    </header>
  );
}

