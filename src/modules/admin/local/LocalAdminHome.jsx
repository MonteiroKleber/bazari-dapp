import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MenuInferior from "../../../components/MenuInferior";

export default function LocalAdminHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F1E0] flex flex-col items-center p-6">
      {/* Título */}
      <h1 className="text-2xl font-bold text-[#8B0000] mb-4">
        {t("localAdmin.title")}
      </h1>
      <p className="text-gray-700 mb-8 text-center max-w-md">
        {t("localAdmin.subtitle")}
      </p>

      {/* Botões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        {/* Área do Cliente */}
        <button
          onClick={() => navigate("/admin/local/client")}
          className="bg-[#8B0000] text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold">{t("localAdmin.client.title")}</h2>
          <p className="text-sm">{t("localAdmin.client.desc")}</p>
        </button>

        {/* Área do Vendedor */}
        <button
          onClick={() => navigate("/admin/local/vendor")}
          className="bg-[#FFB300] text-black p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold">{t("localAdmin.vendor.title")}</h2>
          <p className="text-sm">{t("localAdmin.vendor.desc")}</p>
        </button>

        {/* Área do Entregador */}
        <button
          onClick={() => navigate("/admin/local/delivery")}
          className="bg-[#1C1C1C] text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold">{t("localAdmin.delivery.title")}</h2>
          <p className="text-sm">{t("localAdmin.delivery.desc")}</p>
        </button>
      </div>

            {/* Rodapé */}
            <MenuInferior />
    </div>
  );
}
