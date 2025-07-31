import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Store, MapPin, Car, Layers, Users } from "lucide-react";
import MenuInferior from "../../components/MenuInferior";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const apps = [
    { name: t("admin.app.shop"), icon: Store, path: "/admin/shop" },
    { name: t("admin.app.local"), icon: MapPin, path: "/admin/local" },
    { name: t("admin.app.rides"), icon: Car, path: "/admin/rides" },
    { name: t("admin.app.dao"), icon: Layers, path: "/admin/dao" },
    { name: t("admin.app.connect"), icon: Users, path: "/admin/connect" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0]">
      {/* Header */}
      <header className="bg-[#8B0000] text-white p-4 flex items-center justify-between shadow">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" />
          {t("admin.title")}
        </h1>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 p-4 space-y-6">
        {/* Visão Geral */}
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">{t("admin.overview.title")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FFB300] p-4 rounded-xl shadow text-center">
              <p className="text-sm">{t("admin.overview.establishments")}</p>
              <p className="text-xl font-bold">120</p>
            </div>
            <div className="bg-[#FFB300] p-4 rounded-xl shadow text-center">
              <p className="text-sm">{t("admin.overview.users")}</p>
              <p className="text-xl font-bold">3,500</p>
            </div>
            <div className="bg-[#FFB300] p-4 rounded-xl shadow text-center">
              <p className="text-sm">{t("admin.overview.transactions")}</p>
              <p className="text-xl font-bold">12,450</p>
            </div>
            <div className="bg-[#FFB300] p-4 rounded-xl shadow text-center">
              <p className="text-sm">{t("admin.overview.governance")}</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>
        </section>

        {/* Administração de Aplicativos */}
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-4">{t("admin.apps.title")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {apps.map((app, idx) => (
              <button
                key={idx}
                onClick={() => navigate(app.path)}
                className="flex flex-col items-center p-4 bg-[#8B0000] text-white rounded-xl shadow hover:bg-[#a30000] transition"
              >
                <app.icon className="w-8 h-8 mb-2" />
                <span className="font-medium">{app.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Logs/Admin Settings */}
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">{t("admin.settings.title")}</h2>
          <p className="text-gray-600 text-sm">{t("admin.settings.description")}</p>
        </section>
      </main>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
}
