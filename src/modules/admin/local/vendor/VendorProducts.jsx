import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";
import BuscaInteligente from "../../../../components/BuscaInteligente";

const VendorProducts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // ID do estabelecimento

  const productsMock = [
    { id: 1, name: "Produto 1", price: "10 BZR" },
    { id: 2, name: "Produto 2", price: "25 BZR" },
    { id: 3, name: "Produto Especial", price: "30 BZR" },
  ];

  const [resultados, setResultados] = useState(productsMock);

  const handleAdd = () =>
    navigate(`/admin/vendor/establishment/${id}/product/add`);
  const handleEdit = (productId) =>
    navigate(`/admin/vendor/establishment/${id}/product/${productId}/edit`);
  const handleRemove = (productId) => {
    navigate(`/admin/vendor/establishment/${id}/product/${productId}/remove`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0]">
      {/* Topo */}
      <div className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.products.title")}</h1>
      </div>

      {/* Busca Inteligente */}
      <div className="p-4">
        <BuscaInteligente
          dados={productsMock}
          camposBusca={['name', 'price']}
          placeholder={t("vendor.products.searchPlaceholder")}
          onResultados={(resultadosFiltrados) => {
            if (JSON.stringify(resultadosFiltrados) !== JSON.stringify(resultados)) {
              setResultados(resultadosFiltrados);
            }
          }}
        />

      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4">
        <button
          onClick={handleAdd}
          className="bg-[#FFB300] text-black px-4 py-2 rounded-lg mb-4 hover:bg-[#e6a000] transition"
        >
          {t("vendor.products.addProduct")}
        </button>

        <ul className="space-y-4">
          {resultados.map((product) => (
            <li
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold text-[#1C1C1C]">{product.name}</p>
                <p className="text-sm text-gray-600">{product.price}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(product.id)}
                  className="bg-[#8B0000] text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  {t("vendor.products.edit")}
                </button>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
                >
                  {t("vendor.products.remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
};

export default VendorProducts;
