import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL da API (Sheety) que liga à folha de cálculo
const API_URL = "https://api.sheety.co/632d1f6d9f02ebd3043f6e42d1b07d40/" + encodeURIComponent("folhaDeCálculoSemNome") + "/folha1";

/**
 * COMPONENTE PRINCIPAL (App)
 * Responsável por:
 * 1. Gerir o estado global (lista de carros, navegação, login).
 * 2. Determinar qual ecrã mostrar (Frontoffice, Detalhe ou Backoffice).
 */
function App() {
  // --- ESTADOS (Memória da Aplicação) ---
  const [hondas, setHondas] = useState([]);       // Guarda a lista de carros vinda da API
  const [busca, setBusca] = useState('');         // Guarda o texto da pesquisa
  const [view, setView] = useState('front');      // Controla a navegação ('front' ou 'admin')
  const [idSelecionado, setIdSelecionado] = useState(null); // Guarda o ID do carro que foi clicado
  const [logado, setLogado] = useState(false);    // Controla se o utilizador é admin ou não

  /**
   * FUNÇÃO: carregarDados
   * Objetivo: Fazer o pedido (GET) à API e guardar os dados no estado.
   * Nota: O Sheety devolve um objeto com uma chave dinâmica, por isso usamos Object.keys.
   */
  const carregarDados = async () => {
    try {
      const res = await axios.get(API_URL);
      const chave = Object.keys(res.data)[0]; // Descobre o nome da folha no JSON
      setHondas(res.data[chave] || []);       // Atualiza a lista de carros
    } catch (err) { console.error("Erro ao carregar:", err); }
  };

  /**
   * HOOK: useEffect
   * Executa a função carregarDados() apenas uma vez, quando a aplicação inicia.
   */
  useEffect(() => { carregarDados(); }, []);

  // --- LÓGICA DE FILTRAGEM ---
  // Encontra o carro específico se um ID estiver selecionado
  const carroAtual = hondas.find(h => h.id === idSelecionado);
  // Cria uma nova lista apenas com os carros que correspondem à pesquisa
  const filtrados = hondas.filter(h => h.modelo?.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* MENU SUPERIOR: Navegação entre Stand e Área Admin */}
      <nav style={{ background: '#222', padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => { setView('front'); setIdSelecionado(null); }} style={{ cursor: 'pointer', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}>Ver Stand</button>
        <button onClick={() => setView('admin')} style={{ cursor: 'pointer', padding: '10px 20px', borderRadius: '5px', background: '#cc0000', color: 'white', fontWeight: 'bold' }}>
          {logado ? "Painel de Gestão" : "Área Reservada"}
        </button>
        {logado && <button onClick={() => { setLogado(false); setView('front'); }} style={{ background: '#555', color: 'white', padding: '10px', cursor: 'pointer', borderRadius: '5px', marginLeft: '10px' }}>Sair</button>}
      </nav>

      {/* CONTEÚDO PRINCIPAL: Renderização Condicional */}
      <main style={{ flex: 1 }}>
        {view === 'front' ? (
          // SE ESTIVER NA VISTA 'FRONT'
          carroAtual ? (
            // Se tiver um carro selecionado, mostra DETALHES
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <button onClick={() => setIdSelecionado(null)} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Voltar ao Stand</button>
              <div style={{ background: 'white', padding: '40px', borderRadius: '15px', maxWidth: '700px', margin: 'auto', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                <img src={carroAtual.fotoUrl || carroAtual.fotourl} alt="Honda" style={{ width: '100%', borderRadius: '10px', maxHeight: '450px', objectFit: 'cover' }} />
                <h1 style={{ color: '#cc0000', fontSize: '2.5em' }}>{carroAtual.modelo}</h1>
                <p><strong>Ano:</strong> {carroAtual.ano}</p>
                <p style={{ color: '#000', textAlign: 'center', marginTop: '20px', fontSize: '1.1em', lineHeight: '1.6' }}>
                  {carroAtual.descricao || carroAtual.descrição}
                </p>
              </div>
            </div>
          ) : (
            // Se não tiver carro selecionado, mostra LISTA (Grelha)
            <div>
              <header style={{ background: '#cc0000', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5em', margin: 0 }}>Honda Stand</h1>
                <input 
                  placeholder="Pesquisar modelo..." 
                  onChange={e => setBusca(e.target.value)} 
                  style={{ padding: '15px', borderRadius: '30px', width: '80%', maxWidth: '400px', border: 'none', marginTop: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} 
                />
              </header>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', padding: '50px 20px', justifyContent: 'center' }}>
                {filtrados.map(h => (
                  <div key={h.id} onClick={() => setIdSelecionado(h.id)} style={{ background: 'white', borderRadius: '15px', width: '300px', paddingBottom: '20px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', transition: '0.3s' }}>
                    <img src={h.fotoUrl || h.fotourl} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px 15px 0 0' }} alt="Honda" />
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ borderBottom: '2px solid #cc0000', display: 'inline-block' }}>{h.modelo}</h3>
                      <p>Ano: {h.ano}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          // SE NÃO ESTIVER NA VISTA 'FRONT', MOSTRA O BACKOFFICE
          <Backoffice logado={logado} setLogado={setLogado} hondas={hondas} setHondas={setHondas} />
        )}
      </main>

      {/* --- RODAPÉ --- */}
      <footer style={{ background: '#222', color: '#888', padding: '30px 20px', textAlign: 'center', borderTop: '5px solid #cc0000' }}>
        <div style={{ maxWidth: '1000px', margin: 'auto' }}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Honda Stand</h3>
          <p style={{ fontSize: '0.9em', margin: '5px 0' }}>© 2026 Todos os direitos reservados.</p>
          <p style={{ fontSize: '0.8em', fontStyle: 'italic' }}>Trabalho Prático - Interfaces_Web</p>
          <div style={{ marginTop: '15px', fontSize: '0.8em' }}>
            <span style={{ margin: '0 10px' }}>Privacidade</span> | 
            <span style={{ margin: '0 10px' }}>Termos de Uso</span> | 
            <span style={{ margin: '0 10px' }}>Contactos</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

/**
 * COMPONENTE: Backoffice
 * Responsável por:
 * 1. Autenticação (Login simples).
 * 2. Formulário de CRUD (Criar e Editar).
 * 3. Tabela de Listagem com opção de Eliminar.
 */
function Backoffice({ logado, setLogado, hondas, setHondas }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [editando, setEditando] = useState(null); // Se null = modo criar, se tem ID = modo editar
  const [form, setForm] = useState({ modelo: '', ano: '', descrição: '', fotourl: '' });

  /**
   * FUNÇÃO: handleSubmit
   * Objetivo: Processar o formulário. Decide se cria um novo registo (POST) 
   * ou atualiza um existente (PUT) com base no estado 'editando'.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepara os dados normalizando os campos (tratamento de acentos para o Sheety)
    const dadosParaAPI = {
      modelo: form.modelo,
      ano: form.ano,
      descrição: form.descrição || form.descricao, 
      descricao: form.descrição || form.descricao, 
      fotourl: form.fotourl || form.fotoUrl,
      fotoUrl: form.fotourl || form.fotoUrl
    };

    // O Sheety exige que os dados estejam dentro de um objeto 'raiz' (ex: folha1)
    const payload = { folha1: dadosParaAPI };

    try {
      if (editando) {
        // --- MODO EDIÇÃO (PUT) ---
        await axios.put(`${API_URL}/${editando}`, payload);
        // Atualiza a lista localmente sem precisar recarregar a página
        setHondas(prev => prev.map(h => h.id === editando ? { ...h, ...dadosParaAPI } : h));
        alert("Atualizado com sucesso!");
      } else {
        // --- MODO CRIAÇÃO (POST) ---
        const res = await axios.post(API_URL, payload);
        setHondas(prev => [...prev, res.data.folha1]);
        alert("Adicionado com sucesso!");
      }

      // Limpa o formulário após sucesso
      setEditando(null);
      setForm({ 
        modelo: '', 
        ano: '', 
        descrição: '', 
        descricao: '', 
        fotourl: '', 
        fotoUrl: '' 
      });

    } catch (err) {
      alert("Erro ao gravar. Verifica se os campos na tua folha têm acentos.");
    }
  };

  // Se não estiver logado, mostra apenas o formulário de Login
  if (!logado) return (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', maxWidth: '350px', margin: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h2>Login Admin</h2>
        <input type="text" placeholder="User" onChange={e => setUser(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '10px' }} />
        <input type="password" placeholder="Pass" onChange={e => setPass(e.target.value)} style={{ width: '90%', padding: '10px', marginBottom: '20px' }} />
        {/* Validação simples de credenciais */}
        <button onClick={() => (user === 'admin' && pass === '1234') ? setLogado(true) : alert("Erro!")} style={{ width: '100%', padding: '12px', background: '#cc0000', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '5px' }}>Entrar</button>
      </div>
    </div>
  );

  // Se estiver logado, mostra o Painel de Gestão
  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: 'auto' }}>
      <h2>{editando ? "Editar Veículo" : "Novo Honda"}</h2>
      
      {/* Formulário de Inserção/Edição */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
        <input placeholder="Modelo" value={form.modelo || ''} onChange={e => setForm({...form, modelo: e.target.value})} required style={{ padding: '12px' }} />
        <input placeholder="Ano" value={form.ano || ''} onChange={e => setForm({...form, ano: e.target.value})} required style={{ padding: '12px' }} />
        <input placeholder="URL Imagem" value={form.fotourl || form.fotoUrl || ''} onChange={e => setForm({...form, fotourl: e.target.value})} required style={{ padding: '12px' }} />
        <textarea placeholder="Descrição" value={form.descrição || form.descricao || ''} onChange={e => setForm({...form, descrição: e.target.value})} required style={{ padding: '12px', height: '100px' }} />
        <button type="submit" style={{ padding: '15px', background: editando ? '#007bff' : '#28a745', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '5px' }}>
          {editando ? "GRAVAR ALTERAÇÕES" : "INSERIR NO STAND"}
        </button>
      </form>

      <h3 style={{ marginTop: '40px' }}>Gestão de Stock</h3>
      
      {/* Tabela de Listagem */}
      <table style={{ width: '100%', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <thead style={{ background: '#333', color: 'white' }}>
          <tr><th style={{ padding: '15px' }}>Modelo</th><th style={{ padding: '15px' }}>Ações</th></tr>
        </thead>
        <tbody>
          {hondas.map(h => (
            <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>{h.modelo}</td>
              <td style={{ textAlign: 'center', padding: '15px' }}>
                {/* Botão Editar: Preenche o formulário com os dados deste carro */}
                <button onClick={() => { setEditando(h.id); setForm(h); window.scrollTo(0,0); }} style={{ cursor: 'pointer' }}>Editar</button>
                {/* Botão Eliminar: Chama DELETE na API e atualiza a lista local */}
                <button onClick={() => axios.delete(`${API_URL}/${h.id}`).then(() => setHondas(hondas.filter(x => x.id !== h.id)))} style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;