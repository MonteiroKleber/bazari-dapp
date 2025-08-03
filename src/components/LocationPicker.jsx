import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import L from "leaflet";
import "leaflet-control-geocoder";


function GeocoderControl({ setLocation }) {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      collapsed: false,
      placeholder: "Buscar endereço...",
      defaultMarkGeocode: false
    })
      .on("markgeocode", function (e) {
        const latlng = e.geocode.center;
        setLocation({ lat: latlng.lat, lng: latlng.lng });
        L.marker(latlng).addTo(map);
        map.setView(latlng, 16);
      })
      .addTo(map);

    return () => map.removeControl(geocoder);
  }, [map, setLocation]);

  return null;
}


export default function LocationPicker({ setLocation, initialPosition }) {
  const [markerPos, setMarkerPos] = useState(initialPosition || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Função para buscar sugestões
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSuggestionClick = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setMarkerPos([lat, lon]);
    setLocation({ lat, lng: lon });
    setSuggestions([]);
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMarkerPos([e.latlng.lat, e.latlng.lng]);
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return markerPos ? <Marker position={markerPos} /> : null;
  }

  return (
    <div>
      {/* Campo de busca externo */}
      <div className="mb-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          placeholder="Buscar endereço..."
          className="border rounded p-2 w-full"
        />
        {suggestions.length > 0 && (
          <ul className="bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
            {suggestions.map((s, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(s)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mapa */}
      <MapContainer
        center={markerPos || [-23.55052, -46.633308]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}

