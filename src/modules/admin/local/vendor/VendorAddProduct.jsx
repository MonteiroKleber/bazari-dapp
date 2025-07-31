import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft} from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";

const VendorAddProduct = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => navigate(-1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🚀 Produto cadastrado - futuramente enviar para IPFS + BazariChain");
    // TODO: implementar integração IPFS + BazariChain
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0] text-[#1C1C1C]">
      {/* Header com seta de voltar */}
      <header className="flex items-center p-4 bg-[#8B0000] text-white shadow">

        <button onClick={handleBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-lg font-bold">{t("vendor.addProduct.title")}</h1>
      </header>

      {/* Formulário */}
      <main className="flex-1 p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 space-y-4"
        >
          {/* Nome do Produto */}
          <div>
            <label className="block font-medium">{t("vendor.addProduct.name")}</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-[#FFB300]"
              placeholder={t("vendor.addProduct.namePlaceholder")}
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-medium">{t("vendor.addProduct.description")}</label>
            <textarea
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-[#FFB300]"
              placeholder={t("vendor.addProduct.descriptionPlaceholder")}
              rows="3"
            />
          </div>

          {/* Preço */}
          <div>
            <label className="block font-medium">{t("vendor.addProduct.price")}</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-[#FFB300]"
              placeholder="0.00"
              required
            />
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block font-medium">{t("vendor.addProduct.image")}</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-[#8B0000] text-white font-bold py-2 rounded hover:bg-red-700 transition"
          >
            {t("vendor.addProduct.save")}
          </button>
        </form>
      </main>

      {/* Rodapé padrão */}
      <MenuInferior />
    </div>
  );
};

export default VendorAddProduct;
