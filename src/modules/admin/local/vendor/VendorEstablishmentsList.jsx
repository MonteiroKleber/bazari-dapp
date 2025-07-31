import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MenuInferior from "../../../../components/MenuInferior";
import { ArrowLeft } from "lucide-react";

export default function VendorEstablishmentsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock temporário para os estabelecimentos
  const establishments = [
    { id: 1, name: "Padaria do João", status: "Ativo" },
    { id: 2, name: "Lanches da Maria", status: "Inativo" },
    { id: 3, name: "Lanches da Maria", status: "Inativo" },
    { id: 4, name: "Lanches da Maria", status: "Inativo" },
    { id: 5, name: "Lanches da Maria", status: "Inativo" },
    { id: 6, name: "Lanches da Maria", status: "Inativo" },
    { id: 7, name: "Lanches da Maria", status: "Inativo" },
    { id: 8, name: "Lanches da Maria", status: "Inativo" },
    { id: 9, name: "Lanches da Maria", status: "Inativo" },
    { id: 10, name: "Lanches da Maria", status: "Inativo" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E0] flex flex-col pb-20">
      {/* Cabeçalho com seta de voltar */}
      <div className="flex items-center bg-[#8B0000] text-white p-4">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.list.title")}</h1>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {establishments.map((est) => (
            <div
              key={est.id}
              className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#8B0000]">{est.name}</h2>
                <p className="text-sm text-gray-600">
                  {t("vendor.list.status")}: {est.status}
                </p>
              </div>
              <button
                onClick={() => navigate(`/admin/local/vendor/establishment/${est.id}`)}
                className="bg-[#FFB300] text-black px-4 py-2 rounded-lg hover:shadow-md"
              >
                {t("vendor.list.manage")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Botão adicionar */}
      <div className="fixed bottom-20 right-4">
        <button
          onClick={() => navigate("/admin/local/vendor/add")}
          className="bg-[#8B0000] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl"
        >
          + {t("vendor.list.add")}
        </button>
      </div>

      {/* Rodapé padrão */}
      <MenuInferior />
    </div>
  );
}
