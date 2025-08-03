import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, QrCode, Camera, MapPin } from "lucide-react";
import MenuInferior from "../../../../components/MenuInferior";
import { useTranslation } from "react-i18next";
import QrScanner from "qr-scanner";
import { Html5QrcodeScanner } from "html5-qrcode";
import LocationPicker from "../../../../components/LocationPicker";
import Modal from "react-modal";

export default function VendorEditEstablishment() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { establishmentId } = useParams();

  const [activeTab, setActiveTab] = useState("basic");
  const [showMap, setShowMap] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tokenName: "",
    personType: "fisica",
    document: "",
    categories: [],
    customCategory: "",
    businessSpecific: "",
    reach: "municipal",
    operationType: "online",
    customOperation: "",
    images: [],
    coverImage: null,
    teamMembers: [],
    newMemberName: "",
    newMemberKey: "",
    languages: [],
    openingHours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false },
    },
    location: { lat: "", lng: "" }
  });

  const categoriesList = [
    { value: "food", label: t("vendor.add.category.food") },
    { value: "fashion", label: t("vendor.add.category.fashion") },
    { value: "services", label: t("vendor.add.category.services") },
    { value: "agriculture", label: t("vendor.add.category.agriculture") },
    { value: "tools", label: t("vendor.add.category.tools") },
    { value: "technology", label: t("vendor.add.category.technology") },
    { value: "health", label: t("vendor.add.category.health") },
    { value: "others", label: t("vendor.add.category.others") }
  ];

  const languageOptions = [
    { value: "pt", label: "Português" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" }
  ];

  useEffect(() => {
    // Carregar dados do estabelecimento (exemplo mockado)
    setFormData({
      name: "Pastel da Maria",
      description: "Os melhores pastéis da feira!",
      tokenName: "PASTMAR",
      personType: "fisica",
      document: "123.456.789-00",
      categories: ["food"],
      customCategory: "",
      businessSpecific: "Pastelaria",
      reach: "municipal",
      operationType: "fisico",
      customOperation: "",
      images: [],
      coverImage: null,
      teamMembers: [{ name: "Maria", publicKey: "5F3sa2TJ..." }],
      newMemberName: "",
      newMemberKey: "",
      languages: ["pt"],
      openingHours: {
        monday: { open: "08:00", close: "18:00", closed: false },
        tuesday: { open: "08:00", close: "18:00", closed: false },
        sunday: { open: "", close: "", closed: true }
      },
      location: { lat: "-23.55", lng: "-46.63" }
    });
  }, [establishmentId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...Array.from(files)],
      }));
    } else if (name === "coverImage") {
      setFormData((prev) => ({ ...prev, coverImage: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleCategory = (value) => {
    setFormData((prev) => {
      const updated = prev.categories.includes(value)
        ? prev.categories.filter((c) => c !== value)
        : [...prev.categories, value];
      return { ...prev, categories: updated };
    });
  };

  const toggleLanguage = (value) => {
    setFormData((prev) => {
      const updated = prev.languages.includes(value)
        ? prev.languages.filter((l) => l !== value)
        : [...prev.languages, value];
      return { ...prev, languages: updated };
    });
  };

  const handleHourChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const handleClosedToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], closed: !prev.openingHours[day].closed },
      },
    }));
  };

  const handleQrImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await QrScanner.scanImage(file);
      setFormData((prev) => ({ ...prev, newMemberKey: result }));
    }
  };

  const addTeamMember = () => {
    if (formData.newMemberName.trim() && formData.newMemberKey.trim()) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [
          ...prev.teamMembers,
          { name: prev.newMemberName.trim(), publicKey: prev.newMemberKey.trim() },
        ],
        newMemberName: "",
        newMemberKey: "",
      }));
    }
  };

  const removeTeamMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Alterações salvas:", formData);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E0] flex flex-col pb-20">
      <div className="flex items-center bg-[#8B0000] text-white p-4">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{t("vendor.edit.title")}</h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-around bg-white shadow p-2">
        {["basic", "appearance", "details", "team", "advanced"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "font-bold text-[#8B0000]" : ""}
          >
            {t(`vendor.add.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 bg-white shadow-md rounded-2xl mt-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic */}
          {activeTab === "basic" && (
            <>
              <div>
                <label>{t("vendor.add.name")}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label>{t("vendor.add.description")}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label>{t("vendor.add.tokenName")} (não pode ser alterado)</label>
                <input
                  type="text"
                  name="tokenName"
                  value={formData.tokenName}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-200"
                />
              </div>
            </>
          )}

          {/* Aparência */}
          {activeTab === "appearance" && (
            <>
              <div>
                <label>{t("vendor.add.coverImage")}</label>
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label>{t("vendor.add.images")}</label>
                <input
                  type="file"
                  name="image"
                  multiple
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </>
          )}

          {/* Detalhes */}
          {activeTab === "details" && (
            <>
              <div>
                <label>{t("vendor.add.businessCategory")}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoriesList.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>
              {formData.categories.includes("others") && (
                <div>
                  <label>{t("vendor.add.businessSpecific")}</label>
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              )}
              <div>
                <label>{t("vendor.add.reach")}</label>
                <select
                  name="reach"
                  value={formData.reach}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="municipal">{t("vendor.add.municipal")}</option>
                  <option value="estadual">{t("vendor.add.estadual")}</option>
                  <option value="nacional">{t("vendor.add.nacional")}</option>
                  <option value="internacional">{t("vendor.add.internacional")}</option>
                </select>
              </div>
            </>
          )}

          {/* Equipe */}
          {activeTab === "team" && (
            <div>
              <label>{t("vendor.add.teamMembers")}</label>
              <ul className="list-disc pl-6">
                {formData.teamMembers.map((member, index) => (
                  <li key={index}>
                    {member.name} ({member.publicKey})
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-500 ml-2"
                    >
                      {t("vendor.add.remove")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avançado */}
          {activeTab === "advanced" && (
            <>
              <div>
                <label>{t("vendor.add.supportedLanguages")}</label>
                {languageOptions.map((lang) => (
                  <label key={lang.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang.value)}
                      onChange={() => toggleLanguage(lang.value)}
                    />
                    {lang.label}
                  </label>
                ))}
              </div>
              <div>
                <label>{t("vendor.add.openingHours")}</label>
                {Object.entries(formData.openingHours).map(([day, info]) => (
                  <div key={day} className="flex items-center gap-2">
                    <span>{day}</span>
                    <input
                      type="time"
                      value={info.open}
                      disabled={info.closed}
                      onChange={(e) => handleHourChange(day, "open", e.target.value)}
                    />
                    <input
                      type="time"
                      value={info.close}
                      disabled={info.closed}
                      onChange={(e) => handleHourChange(day, "close", e.target.value)}
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={info.closed}
                        onChange={() => handleClosedToggle(day)}
                      /> {t("vendor.add.closed")}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <label>{t("vendor.add.geolocation")}</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder={t("vendor.add.latitude")}
                    value={formData.location.lat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, lat: e.target.value },
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder={t("vendor.add.longitude")}
                    value={formData.location.lng}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, lng: e.target.value },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="p-2 bg-blue-500 text-white rounded"
                  >
                    <MapPin />
                  </button>
                </div>
                <Modal
                  isOpen={showMap}
                  onRequestClose={() => setShowMap(false)}
                  contentLabel="Selecionar Localização"
                  className="bg-white p-4 rounded shadow-lg w-[95%] max-w-2xl mx-auto mt-20"
                  overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                  <LocationPicker
                    setLocation={(loc) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: { lat: loc.lat, lng: loc.lng },
                      }));
                      setShowMap(false);
                    }}
                    initialPosition={[parseFloat(formData.location.lat), parseFloat(formData.location.lng)]}
                  />
                </Modal>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-[#FFB300] py-3 rounded-lg">
            {t("vendor.edit.save")}
          </button>
        </form>
      </div>

      <MenuInferior />
    </div>
  );
}
