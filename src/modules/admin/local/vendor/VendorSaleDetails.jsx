import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MenuInferior from "../../../../components/MenuInferior";
import { ArrowLeft } from "lucide-react";

const VendorSaleDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // ID da venda passado pela rota
  const [sale, setSale] = useState(null);

  // 🔹 Simulação de busca de dados - depois integrar com IPFS/BazariChain
  useEffect(() => {
    const mockSales = [
      {
        id: "1",
        buyer: "0xABC123",
        value: "50 BZR",
        products: "Pizza, Refrigerante",
        date: "2025-07-28 14:20",
        status: "pago",
        deliveryAddress: "Rua das Flores, 123, São Paulo",
        seller: "0xSELLER001",
        paymentTx: "0xHASH1234567890",
        notes: "Cliente pediu sem cebola",
      },
      {
        id: "2",
        buyer: "0xXYZ789",
        value: "30 BZR",
        products: "Hambúrguer",
        date: "2025-07-28 12:45",
        status: "entregue",
        deliveryAddress: "Av Paulista, 1000, São Paulo",
        seller: "0xSELLER002",
        paymentTx: "0xHASH987654321",
        notes: "Entrega rápida solicitada",
      },
    ];

    const foundSale = mockSales.find((s) => s.id === id);
    setSale(foundSale || null);
  }, [id]);

  const handleBack = () => {
    window.history.back();
  };

  if (!sale) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F1E0] text-black">
        <div className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
          <button onClick={handleBack} className="mr-3">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{t("vendor.saleDetails.title")}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-600">
          {t("vendor.saleDetails.notFound")}
        </div>
        <MenuInferior />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0] text-black">
      {/* 🔙 Header */}
      <div className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
        <button onClick={handleBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.saleDetails.title")}</h1>
      </div>

      {/* 🧾 Detalhes da Venda */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-5 border-l-4 border-[#FFB300]">
          <p className="font-semibold">{t("vendor.saleDetails.buyer")}: {sale.buyer}</p>
          <p>{t("vendor.saleDetails.value")}: {sale.value}</p>
          <p>{t("vendor.saleDetails.products")}: {sale.products}</p>
          <p>{t("vendor.saleDetails.date")}: {sale.date}</p>
          <p className="capitalize">{t("vendor.saleDetails.status")}: {sale.status}</p>
          <p>{t("vendor.saleDetails.address")}: {sale.deliveryAddress}</p>
          <p>{t("vendor.saleDetails.seller")}: {sale.seller}</p>
          <p>{t("vendor.saleDetails.paymentTx")}: {sale.paymentTx}</p>
          <p>{t("vendor.saleDetails.notes")}: {sale.notes}</p>
        </div>
      </div>

      {/* Rodapé padrão */}
      <MenuInferior />
    </div>
  );
};

export default VendorSaleDetails;
