import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Package,  Users, FileText } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";

export default function VendorEstablishmentDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [establishment, setEstablishment] = useState({
    name: "Meu Estabelecimento",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    openingHours: "08:00 - 18:00",
    image: null,
  });

  const handleEdit = () => {
    // 🔗 Navegar para tela de edição futuramente
    console.log("Editar estabelecimento:", id);
  };

  const handleDelete = () => {
    // 🔗 Integração com BazariChain para exclusão
    console.log("Remover estabelecimento:", id);
    navigate(-1);
  };

  const handleManageProducts = () => {
    // 🔗 Navegar para gerenciamento de produtos
    navigate(`/admin/local/vendor/establishment/${id}/products`);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E0] flex flex-col pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center bg-[#8B0000] text-white p-4">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.details.title")}</h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-6">
        <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
          {/* Imagem */}
          {establishment.image ? (
            <img
              src={establishment.image}
              alt={establishment.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">{t("vendor.details.noImage")}</span>
            </div>
          )}

          {/* Dados */}
          <div className="text-[#1C1C1C] space-y-2">
            <h2 className="text-2xl font-bold">{establishment.name}</h2>
            <p>
              {establishment.city} - {establishment.state}, {establishment.country}
            </p>
            <p>{t("vendor.details.openingHours")}: {establishment.openingHours}</p>
          </div>

          {/* Ações */}
          <div className="flex flex-col space-y-3 mt-4">
            <button
              onClick={handleEdit}
              className="flex items-center justify-center bg-[#FFB300] text-black py-3 rounded-lg hover:shadow-md"
            >
              <Edit3 size={20} className="mr-2" /> {t("vendor.details.edit")}
            </button>

            <button
              onClick={handleManageProducts}
              className="flex items-center justify-center bg-[#1C1C1C] text-white py-3 rounded-lg hover:shadow-md"
            >
              <Package size={20} className="mr-2" /> {t("vendor.details.manageProducts")}
            </button>

            <button
              onClick={() => navigate(`/admin/local/vendor/establishment/${id}/deliverers`)}
              className="flex items-center justify-center bg-[#8B0000] text-white py-3 rounded-lg hover:shadow-md"
            >
              <Users size={20} className="mr-2" /> {t("vendor.details.manageDeliverers")}
            </button>


            {/* ✅ Novo botão para histórico de vendas */}
            <button
              onClick={() => navigate(`/admin/local/vendor/establishment/${id}/sales-history`)}
              className="flex items-center justify-center bg-[#FFB300] text-black py-3 rounded-lg hover:shadow-md"
            >
              <FileText size={20} className="mr-2" /> {t("vendor.details.salesHistory")}
            </button>


            <button
              onClick={handleDelete}
              className="flex items-center justify-center bg-red-600 text-white py-3 rounded-lg hover:shadow-md"
            >
              <Trash2 size={20} className="mr-2" /> {t("vendor.details.delete")}
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
}
