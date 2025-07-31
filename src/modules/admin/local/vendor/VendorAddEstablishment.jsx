import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";

export default function VendorAddEstablishment() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    city: "",
    state: "",
    country: "",
    openingHours: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do estabelecimento:", formData);
    // 🔗 Aqui será feita integração com IPFS + BazariChain
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E0] flex flex-col pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center bg-[#8B0000] text-white p-4">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.add.title")}</h1>
      </div>

      {/* Formulário */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.name")}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.cnpj")}</label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.city")}</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.state")}</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.country")}</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Horário de funcionamento */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.openingHours")}</label>
            <input
              type="text"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Imagem */}
          <div>
            <label className="block text-[#1C1C1C] mb-1">{t("vendor.add.image")}</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-[#FFB300] text-black py-3 rounded-lg hover:shadow-md"
          >
            {t("vendor.add.save")}
          </button>
        </form>
      </div>

      {/* Rodapé */}
      <MenuInferior />
    </div>
  );
}
