import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";

const VendorRemoveProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // ID do produto a ser removido

  const handleRemove = () => {
    // 🚀 Integração futura com BazariChain para exclusão
    console.log("Produto removido:", id);
    navigate(-1); // Voltar para a listagem
  };

  const handleCancel = () => {
    navigate(-1); // Cancelar remoção
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0] text-[#1C1C1C]">
      {/* Cabeçalho */}
      <header className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
        
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-lg font-bold">{t("removeProduct.title")}</h1>
      </header>

      {/* Corpo da Página */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="mb-6 text-lg">
          {t("removeProduct.confirmation")}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleRemove}
            className="px-6 py-2 bg-[#8B0000] text-white rounded hover:bg-red-700"
          >
            {t("removeProduct.confirmButton")}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-400 text-black rounded hover:bg-gray-500"
          >
            {t("removeProduct.cancelButton")}
          </button>
        </div>
      </main>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
};

export default VendorRemoveProduct;
