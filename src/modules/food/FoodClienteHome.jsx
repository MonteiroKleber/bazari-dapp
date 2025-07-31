import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import MenuInferior from '../../components/MenuInferior';
import HeaderSimples from '../../components/HeaderSimples';
import BuscaInteligente from '../../components/BuscaInteligente';

const estabelecimentosMock = [
  {
    nome: 'Lanche do Tio Zé',
    produto: 'Hambúrguer artesanal',
    bairro: 'Setor Bela Vista',
    cidade: 'Goiânia',
    pais: 'Brasil',
  },
  {
    nome: 'Pastel da Maria',
    produto: 'Pastel de queijo',
    bairro: 'Centro',
    cidade: 'São Paulo',
    pais: 'Brasil',
  },
  {
    nome: 'Pizza do João',
    produto: 'Pizza calabresa',
    bairro: 'Copacabana',
    cidade: 'Rio de Janeiro',
    pais: 'Brasil',
  },
  {
    nome: 'Tio Zé Burgers',
    produto: 'X-Salada',
    bairro: 'Setor Oeste',
    cidade: 'Goiânia',
    pais: 'Brasil',
  },
];

export default function FoodClienteHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState(estabelecimentosMock);

  return (
    <div className="min-h-screen bg-neutral font-nunito pb-20">
      <HeaderSimples titulo="Bazari Local" onVoltar={() => navigate('/food-home')} />

      <main className="p-4">
        <BuscaInteligente
          dados={estabelecimentosMock}
          camposBusca={['nome', 'produto', 'bairro', 'cidade', 'pais']}
          placeholder="Digite: nome, produto, bairro, cidade..."
          onResultados={setResultados}
        />

        <ul className="space-y-4">
          {resultados.map((item, index) => (
            <li
              key={index}
              className="bg-white rounded-lg p-4 shadow cursor-pointer hover:bg-gray-100 transition"
              onClick={() => navigate(`/food-estabelecimento/${encodeURIComponent(item.nome)}`)}
            >
              <h2 className="font-bold text-lg text-primary">{item.nome}</h2>
              <p className="text-sm">{item.produto}</p>
              <p className="text-sm text-gray-600">{item.bairro}, {item.cidade} - {item.pais}</p>
            </li>
          ))}
        </ul>
      </main>

      <MenuInferior />
    </div>
  );
}

