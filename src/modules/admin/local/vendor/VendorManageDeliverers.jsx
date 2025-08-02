import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";
import BuscaInteligente from "../../../../components/BuscaInteligente";

export default function VendorManageDeliverers() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock de entregadores - futuramente virá do blockchain/IPFS
  const [deliverers, setDeliverers] = useState([
    { id: 1, name: "João Silva", status: "pending" },
    { id: 2, name: "Maria Souza", status: "accepted" },
    { id: 3, name: "Carlos Lima", status: "rejected" },
  ]);

  const [resultados, setResultados] = useState(deliverers);

  // Desvincular entregador (mantém na lista, status "unlinked")
  const handleUnlink = (id) => {
    setDeliverers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "unlinked" } : d))
    );
  };

  // Excluir entregador da lista
  const handleDelete = (id) => {
    setDeliverers((prev) => prev.filter((d) => d.id !== id));
  };

  // Adicionar (simulação de convite)
  const handleAddDeliverer = () => {
    const newDeliverer = {
      id: Date.now(),
      name: `Novo Entregador ${deliverers.length + 1}`,
      status: "pending",
    };
    setDeliverers((prev) => [...prev, newDeliverer]);
  };

  const handleNavigateInviteDeliverers = () => {
    navigate("/admin/local/vendor/establishment/invite-deliverers");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E0]">

      

      {/* Cabeçalho */}
      <div className="flex items-center p-4 bg-[#8B0000] text-white shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.manageDeliverers.title")}</h1>
      </div>


      {/* Busca Inteligente */}
      <div className="p-4">
        <BuscaInteligente
          dados={deliverers}
          camposBusca={["name", "status"]}
          placeholder={t("vendor.manageDeliverers.searchPlaceholder")}
          onResultados={(resultadosFiltrados) => {
            if (JSON.stringify(resultadosFiltrados) !== JSON.stringify(resultados)) {
              setResultados(resultadosFiltrados);
            }
          }}
        />
      </div>

      {/* Botão alinhado verticalmente */}
      <div className="pl-4 mb-4">
        
        <button
          onClick={handleNavigateInviteDeliverers}
          className="bg-[#FFB300] text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500"
        >
          {t("vendor.manageDeliverers.invite")}
        </button>


      </div>


             


      {/* Lista de entregadores */}
      <div className="flex-1 p-4 space-y-3">
        {resultados.length > 0 ? (
          resultados.map((deliverer) => (
            <div
              key={deliverer.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-[#1C1C1C]">{deliverer.name}</p>
                <p className="text-sm text-gray-500">{t(`vendor.manageDeliverers.status.${deliverer.status}`)}</p>
              </div>
              <div className="flex mt-2 sm:mt-0 space-x-2">
                <button
                  onClick={() => handleUnlink(deliverer.id)}
                  className="px-3 py-1 bg-[#FFB300] text-white rounded-lg hover:opacity-90"
                >
                  {t("vendor.manageDeliverers.unlink")}
                </button>
                <button
                  onClick={() => handleDelete(deliverer.id)}
                  className="px-3 py-1 bg-[#8B0000] text-white rounded-lg hover:opacity-90"
                >
                  {t("vendor.manageDeliverers.delete")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">{t("vendor.manageDeliverers.noDeliverers")}</p>
        )}
      </div>


      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
}
