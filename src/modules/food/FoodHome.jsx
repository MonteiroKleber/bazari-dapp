// src/modules/food/FoodHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import MenuInferior from "../../components/MenuInferior";

export default function FoodHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen font-nunito bg-neutral text-dark">
      {/* Cabeçalho fixo com título */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="text-white" size={24} />
        </button>
        <h1 className="text-lg font-bold">Bazari Local</h1>
        <div className="w-6" /> {/* espaço para alinhamento */}
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow px-4 pt-10 pb-28 flex flex-col gap-6 items-center justify-start">
        <h2 className="text-xl font-semibold text-center">
          {t("foodHome.subtitle")}
        </h2>

        <button
          onClick={() => navigate("/food/cliente")}
          className="w-full max-w-md bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-800 transition"
        >
          🍽️ {t("foodHome.asClient")}
        </button>

        <button
          onClick={() => navigate("/food/vendedor")}
          className="w-full max-w-md bg-accent text-dark py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition"
        >
          🛒 {t("foodHome.asVendor")}
        </button>

        <button
          onClick={() => navigate("/food/entregador")}
          className="w-full max-w-md bg-dark text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition"
        >
          🚴 {t("foodHome.asDelivery")}
        </button>
      </main>

      {/* Rodapé fixo */}
      <MenuInferior />
    </div>
  );
}

