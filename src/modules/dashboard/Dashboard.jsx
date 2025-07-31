import React from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import MenuInferior from '../../components/MenuInferior';


export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral font-nunito pb-20">
      <Header userName="Cidadão Bazari" onLogout={() => console.log('Logout')} />

      <main className="p-4 space-y-6">
        <section className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-lg font-bold text-primary mb-2">
            {t('dashboard.welcome')}
          </h2>
          <p className="text-sm text-dark">
            {t('dashboard.subtitle')}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <CardAtalho
            emoji="🛒"
            label={t('dashboard.atalhos.marketplace')}
            onClick={() => console.log('Ir para Marketplace')}
          />
          <CardAtalho
            emoji="🏘️"
            label={t('dashboard.atalhos.food')}
            onClick={() => navigate('/food-home')}
          />
          <CardAtalho
            emoji="🚗"
            label={t('dashboard.atalhos.rides')}
            onClick={() => console.log('Ir para BazariRides')}
          />
          <CardAtalho
            emoji="🏛️"
            label={t('dashboard.atalhos.dao')}
            onClick={() => console.log('Ir para DAO')}
          />
          <CardAtalho
            emoji="💬"
            label={t('dashboard.atalhos.rede_social')}
            onClick={() => console.log('Ir para Rede Social')}
          />
          <CardAtalho
            emoji="🛡️"
            label={t('dashboard.atalhos.administracao')}
            onClick={() => navigate('/admin-dashboard')}
          />
        </section>
      </main>

      <MenuInferior />
    </div>
  );
}

function CardAtalho({ emoji, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center hover:bg-gray-100 transition"
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-semibold text-dark mt-2 text-center">{label}</span>
    </button>
  );
}

