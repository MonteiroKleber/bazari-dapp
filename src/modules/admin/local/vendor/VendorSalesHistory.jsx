import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MenuInferior from "../../../../components/MenuInferior";
import BuscaInteligente from "../../../../components/BuscaInteligente";
import { ArrowLeft } from "lucide-react";

const VendorSalesHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);

  // Carrega dados mockados das vendas
  useEffect(() => {
    const mockSales = [
      { 
        id: "1", 
        buyer: "0xABC123", 
        value: "50 BZR", 
        products: "Pizza, Refrigerante", 
        date: "2025-07-28 14:20", 
        status: "pago" 
      },
      { 
        id: "2", 
        buyer: "0xXYZ789", 
        value: "30 BZR", 
        products: "Hambúrguer", 
        date: "2025-07-28 12:45", 
        status: "pago" 
      },
    ];
    setSales(mockSales);
    setFilteredSales(mockSales);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaleClick = (id) => {
    navigate(`/admin/local/vendor/sales/details/${id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F1E0] text-black">
      {/* Header */}
      <div className="flex items-center bg-[#8B0000] text-white p-4 shadow-md">
        <ArrowLeft
          onClick={handleBack}
          className="cursor-pointer mr-4"
          size={24}
        />
        <h1 className="text-xl font-bold">
          {t("vendor.salesHistory.title")}
        </h1>
      </div>

      {/* Busca Inteligente */}
      <div className="p-4">
        <BuscaInteligente
          dados={sales}
          camposBusca={["buyer", "value", "products", "date", "status"]}
          placeholder={t("vendor.salesHistory.searchPlaceholder")}
          onResultados={(resultadosFiltrados) => {
            if (JSON.stringify(resultadosFiltrados) !== JSON.stringify(filteredSales)) {
              setFilteredSales(resultadosFiltrados);
            }
          }}
        />
      </div>

      {/* Lista de Vendas */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              onClick={() => handleSaleClick(sale.id)}
              className="bg-white shadow-md rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-100"
            >
              <p>
                <strong>{t("vendor.salesHistory.buyer")}:</strong> {sale.buyer}
              </p>
              <p>
                <strong>{t("vendor.salesHistory.value")}:</strong> {sale.value}
              </p>
              <p>
                <strong>{t("vendor.salesHistory.products")}:</strong> {sale.products}
              </p>
              <p>
                <strong>{t("vendor.salesHistory.date")}:</strong> {sale.date}
              </p>
              <p>
                <strong>{t("vendor.salesHistory.status")}:</strong> {sale.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            {t("vendor.salesHistory.noSales")}
          </p>
        )}
      </div>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
};

export default VendorSalesHistory;
