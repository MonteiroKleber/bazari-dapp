import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MenuInferior from "../../../../components/MenuInferior";
import { ArrowLeft } from "lucide-react";

const VendorSalesHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);

  // 🔹 Simulação de dados - integrar com IPFS/BazariChain depois
  useEffect(() => {
    setSales([
      { id: "1", buyer: "0xABC123", value: "50 BZR", products: "Pizza, Refrigerante", date: "2025-07-28 14:20", status: "pago" },
      { id: "2", buyer: "0xXYZ789", value: "30 BZR", products: "Hambúrguer", date: "2025-07-28 12:45", status: "pago" }
    ]);
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleViewDetails = (saleId) => {
    navigate(`/admin/local/vendor/sales/details/${saleId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0] text-black">
      {/* 🔙 Header */}
      <div className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
        <button onClick={handleBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.salesHistory.title")}</h1>
      </div>

      {/* 📜 Lista de Vendas */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white shadow-md rounded-xl p-5 mb-4 border-l-4 border-[#FFB300] cursor-pointer hover:bg-gray-100 transition"
            onClick={() => handleViewDetails(sale.id)}
          >
            <p className="font-semibold">{t("vendor.salesHistory.buyer")}: {sale.buyer}</p>
            <p>{t("vendor.salesHistory.value")}: {sale.value}</p>
            <p>{t("vendor.salesHistory.products")}: {sale.products}</p>
            <p>{t("vendor.salesHistory.date")}: {sale.date}</p>            
          </div>
        ))}
      </div>

      {/* Rodapé padrão */}
      <MenuInferior />
    </div>
  );
};

export default VendorSalesHistory;
