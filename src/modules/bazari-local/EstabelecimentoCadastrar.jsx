// src/modules/bazari-local/EstabelecimentoCadastrar.jsx
import React, { useState } from 'react';

const EstabelecimentoCadastrar = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [horario, setHorario] = useState('');
  const [produtos, setProdutos] = useState([{ nome: '', preco: '' }]);
  const [imagemCapa, setImagemCapa] = useState(null);
  const [preview, setPreview] = useState(null);

  const adicionarProduto = () => {
    setProdutos([...produtos, { nome: '', preco: '' }]);
  };

  const handleProdutoChange = (index, field, value) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][field] = value;
    setProdutos(novosProdutos);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    setImagemCapa(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dados = {
      nome,
      descricao,
      cidade,
      bairro,
      horario,
      produtos,
      capaBase64: imagemCapa ? await toBase64(imagemCapa) : null
    };

    console.log('Estabelecimento para IPFS:', dados);

    // TODO:
    // 1. Fazer upload no IPFS
    // 2. Registrar CID + pubkey na blockchain

    alert('Cadastro preparado (IPFS + blockchain ainda não integrados).');
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#8B0000] mb-4">Cadastrar Estabelecimento</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nome" className="w-full p-2 border rounded" value={nome} onChange={(e) => setNome(e.target.value)} />
        <textarea placeholder="Descrição" className="w-full p-2 border rounded" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <input type="text" placeholder="Cidade" className="w-full p-2 border rounded" value={cidade} onChange={(e) => setCidade(e.target.value)} />
        <input type="text" placeholder="Bairro" className="w-full p-2 border rounded" value={bairro} onChange={(e) => setBairro(e.target.value)} />
        <input type="text" placeholder="Horário de Funcionamento" className="w-full p-2 border rounded" value={horario} onChange={(e) => setHorario(e.target.value)} />

        <div>
          <label className="block font-semibold mb-1">Produtos:</label>
          {produtos.map((p, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input type="text" placeholder="Nome do produto" className="flex-1 p-2 border rounded" value={p.nome} onChange={(e) => handleProdutoChange(index, 'nome', e.target.value)} />
              <input type="text" placeholder="Preço" className="w-24 p-2 border rounded" value={p.preco} onChange={(e) => handleProdutoChange(index, 'preco', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={adicionarProduto} className="text-sm text-blue-600 underline">+ Adicionar produto</button>
        </div>

        <div>
          <label className="block font-semibold mb-1">Imagem de Capa:</label>
          <input type="file" accept="image/*" onChange={handleImagemChange} />
          {preview && <img src={preview} alt="Prévia" className="mt-2 w-full max-h-48 object-cover rounded" />}
        </div>

        <button type="submit" className="w-full bg-[#8B0000] text-white p-3 rounded font-bold">Salvar Estabelecimento</button>
      </form>
    </div>
  );
};

export default EstabelecimentoCadastrar;

