import React from 'react'

// ===============================
// COMPONENTE TESTE DE ESTILOS
// ===============================
const TestStyles = () => {
  return (
    <div className="min-h-screen bg-bazari-light p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header de Teste */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-bazari-primary mb-4">
            🎨 Teste de Estilos Bazari
          </h1>
          <p className="text-bazari-dark/70 text-lg">
            Verificando se TailwindCSS + cores customizadas estão funcionando
          </p>
        </div>

        {/* Teste de Cores */}
        <div className="bg-white rounded-2xl p-6 shadow-bazari">
          <h2 className="text-2xl font-semibold text-bazari-dark mb-6">
            Paleta de Cores Oficial
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bazari-primary text-white p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Primária #8B0000</h3>
              <p className="text-sm opacity-90">Vermelho terroso - resistência e povo</p>
            </div>
            
            <div className="bg-bazari-secondary text-bazari-dark p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Secundária #FFB300</h3>
              <p className="text-sm opacity-80">Dourado queimado - riqueza e esperança</p>
            </div>
            
            <div className="bg-bazari-dark text-white p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Escuro #1C1C1C</h3>
              <p className="text-sm opacity-90">Preto fosco - descentralização e poder</p>
            </div>
            
            <div className="bg-bazari-light border-2 border-bazari-primary text-bazari-dark p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Claro #F5F1E0</h3>
              <p className="text-sm opacity-80">Areia clara - simplicidade, papel e rua</p>
            </div>
          </div>
        </div>

        {/* Teste de Componentes */}
        <div className="bg-white rounded-2xl p-6 shadow-bazari">
          <h2 className="text-2xl font-semibold text-bazari-dark mb-6">
            Componentes Base
          </h2>
          
          <div className="space-y-6">
            {/* Botões */}
            <div>
              <h3 className="text-lg font-medium text-bazari-dark mb-3">Botões</h3>
              <div className="flex flex-wrap gap-3">
                <button className="bg-bazari-primary hover:bg-bazari-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-colors">
                  Primário
                </button>
                <button className="bg-bazari-secondary hover:bg-bazari-secondary-hover text-bazari-dark px-6 py-3 rounded-xl font-medium transition-colors">
                  Secundário
                </button>
                <button className="border-2 border-bazari-primary text-bazari-primary hover:bg-bazari-primary hover:text-white px-6 py-3 rounded-xl font-medium transition-colors">
                  Outline
                </button>
                <button className="text-bazari-primary hover:bg-bazari-primary/10 px-6 py-3 rounded-xl font-medium transition-colors">
                  Ghost
                </button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-lg font-medium text-bazari-dark mb-3">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-bazari-light p-4 rounded-xl border border-bazari-primary/20">
                  <h4 className="font-semibold text-bazari-primary mb-2">Card Básico</h4>
                  <p className="text-bazari-dark/70 text-sm">Conteúdo do card com estilo Bazari</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-bazari hover:shadow-bazari-lg transition-shadow cursor-pointer">
                  <h4 className="font-semibold text-bazari-dark mb-2">Card com Shadow</h4>
                  <p className="text-bazari-dark/70 text-sm">Hover para ver o efeito de sombra</p>
                </div>
                
                <div className="bg-gradient-to-r from-bazari-primary to-bazari-primary-light p-4 rounded-xl text-white">
                  <h4 className="font-semibold mb-2">Card Gradiente</h4>
                  <p className="text-white/90 text-sm">Fundo com gradiente personalizado</p>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 className="text-lg font-medium text-bazari-dark mb-3">Estados</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-success/10 border border-success/20 text-success p-3 rounded-lg text-center">
                  <div className="font-semibold">Sucesso</div>
                  <div className="text-sm opacity-80">#4CAF50</div>
                </div>
                
                <div className="bg-warning/10 border border-warning/20 text-warning p-3 rounded-lg text-center">
                  <div className="font-semibold">Aviso</div>
                  <div className="text-sm opacity-80">#FF9800</div>
                </div>
                
                <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-center">
                  <div className="font-semibold">Erro</div>
                  <div className="text-sm opacity-80">#F44336</div>
                </div>
                
                <div className="bg-info/10 border border-info/20 text-info p-3 rounded-lg text-center">
                  <div className="font-semibold">Info</div>
                  <div className="text-sm opacity-80">#2196F3</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teste de Responsividade */}
        <div className="bg-white rounded-2xl p-6 shadow-bazari">
          <h2 className="text-2xl font-semibold text-bazari-dark mb-6">
            Responsividade
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bazari-light p-4 rounded-lg text-center">
              <div className="text-bazari-primary font-semibold">Mobile</div>
              <div className="text-sm text-bazari-dark/70">1 coluna</div>
            </div>
            
            <div className="bg-bazari-light p-4 rounded-lg text-center sm:block hidden">
              <div className="text-bazari-primary font-semibold">Tablet</div>
              <div className="text-sm text-bazari-dark/70">2 colunas</div>
            </div>
            
            <div className="bg-bazari-light p-4 rounded-lg text-center lg:block hidden">
              <div className="text-bazari-primary font-semibold">Desktop</div>
              <div className="text-sm text-bazari-dark/70">4 colunas</div>
            </div>
            
            <div className="bg-bazari-light p-4 rounded-lg text-center lg:block hidden">
              <div className="text-bazari-primary font-semibold">Grande</div>
              <div className="text-sm text-bazari-dark/70">4 colunas</div>
            </div>
          </div>
        </div>

        {/* Status do TailwindCSS */}
        <div className="bg-white rounded-2xl p-6 shadow-bazari">
          <h2 className="text-2xl font-semibold text-bazari-dark mb-4">
            Status do Sistema
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-bazari-dark/70">TailwindCSS</span>
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                ✅ Funcionando
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-bazari-dark/70">Cores Bazari</span>
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                ✅ Carregadas
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-bazari-dark/70">Responsividade</span>
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                ✅ Ativa
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-bazari-dark/70">Animações</span>
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                ✅ Suaves
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-bazari-dark/60 py-8">
          <p>Se você pode ver este teste com as cores corretas, os estilos estão funcionando! 🎉</p>
        </div>

      </div>
    </div>
  )
}

export default TestStyles