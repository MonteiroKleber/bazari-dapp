import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";
import BuscaInteligente from "../../../../components/BuscaInteligente";

const VendorInviteDeliverers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Dados mockados para exemplo
  const deliverersMock = [
    { id: 1, name: "João Entregador", city: "São Paulo", state: "SP", pubKey: "0x123", invited: false },
    { id: 2, name: "Maria Moto", city: "Rio de Janeiro", state: "RJ", pubKey: "0x456", invited: true },
    { id: 3, name: "Pedro Delivery", city: "Curitiba", state: "PR", pubKey: "0x789", invited: false },
  ];

  const [resultados, setResultados] = useState(deliverersMock);

  const handleInvite = (delivererId) => {
    console.log("Convidar entregador:", delivererId);
    // 🔗 Integração futura com BazariChain para envio de convite
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0]">
      {/* Topo */}
      <div className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.inviteDeliverers.title")}</h1>
      </div>

      {/* Busca Inteligente */}
      <div className="p-4">
        <BuscaInteligente
          dados={deliverersMock}
          camposBusca={['name', 'city', 'state', 'pubKey']}
          placeholder={t("vendor.inviteDeliverers.searchPlaceholder")}
          onResultados={(resultadosFiltrados) => {
            if (JSON.stringify(resultadosFiltrados) !== JSON.stringify(resultados)) {
              setResultados(resultadosFiltrados);
            }
          }}
        />
      </div>

      {/* Lista */}
      <div className="flex-1 p-4">
        <ul className="space-y-4">
          {resultados.map((deliverer) => (
            <li
              key={deliverer.id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold text-[#1C1C1C]">{deliverer.name}</p>
                <p className="text-sm text-gray-600">
                  {deliverer.city} - {deliverer.state}
                </p>
                <p className="text-xs text-gray-500">🔑 {deliverer.pubKey}</p>
              </div>
              <button
                onClick={() => handleInvite(deliverer.id)}
                disabled={deliverer.invited}
                className={`px-3 py-1 rounded transition ${
                  deliverer.invited
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#FFB300] text-black hover:bg-yellow-500"
                }`}
              >
                {deliverer.invited
                  ? t("vendor.inviteDeliverers.alreadyInvited")
                  : t("vendor.inviteDeliverers.invite")}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
};

export default VendorInviteDeliverers;
