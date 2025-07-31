import React, { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';

export default function BuscaInteligente({ dados, camposBusca, placeholder, onResultados }) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(dados, {
      keys: camposBusca,
      threshold: 0.4, // sensibilidade
    });
  }, [dados, camposBusca]);

  const resultados = useMemo(() => {
    if (!query) return dados;
    return fuse.search(query).map((res) => res.item);
  }, [query, fuse, dados]);

  // ✅ Correção: não incluir `onResultados` no array para evitar loop infinito
  useEffect(() => {
    if (typeof onResultados === 'function') {
      onResultados(resultados);
    }
  }, [resultados]); // apenas resultados como dependência

  return (
    <input
      type="text"
      placeholder={placeholder || 'Buscar...'}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full p-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-accent mb-4"
    />
  );
}
