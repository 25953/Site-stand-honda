import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- CONFIGURAÇÃO ---
const API_URL = "https://api.sheety.co/67597d68af1064ee772ed84ccdc4651b/standHonda/carros";
const API_USERS = "https://api.sheety.co/67597d68af1064ee772ed84ccdc4651b/standHonda/users";

// --- ESTILOS GLOBAIS (THEME) ---
const theme = {
  colors: {
    primary: '#cc0000', // Honda Red
    dark: '#000000',
    gray: '#333333',
    lightGray: '#f4f4f4',
    white: '#ffffff',
    border: '#e0e0e0',
    success: '#28a745',
    danger: '#dc3545'
  },
  fonts: {
    main: "'Helvetica Neue', Helvetica, Arial, sans-serif"
  }
};

const styles = {
  container: { fontFamily: theme.fonts.main, backgroundColor: theme.colors.lightGray, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: { background: theme.colors.dark, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: `3px solid ${theme.colors.primary}` },
  navBrand: { color: theme.colors.white, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' },
  navMenu: { display: 'flex', gap: '15px' },
  btnNav: { background: 'transparent', color: '#aaa', border: '1px solid #444', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', transition: '0.3s', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  btnNavActive: { background: theme.colors.white, color: theme.colors.dark, borderColor: theme.colors.white },
  btnPrimary: { background: theme.colors.primary, color: theme.colors.white, border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem', transition: '0.2s' },
  btnDanger: { background: 'transparent', color: theme.colors.danger, border: `1px solid ${theme.colors.danger}`, padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  input: { padding: '12px', borderRadius: '4px', border: `1px solid ${theme.colors.border}`, width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
  card: { background: theme.colors.white, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'transform 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', padding: '40px', maxWidth: '1200px', margin: '0 auto' },
  header: { background: theme.colors.white, padding: '60px 20px', textAlign: 'center', borderBottom: `1px solid ${theme.colors.border}` },
  table: { width: '100%', borderCollapse: 'collapse', background: theme.colors.white, marginTop: '20px', borderRadius: '8px', overflow: 'hidden' },
  th: { background: theme.colors.gray, color: theme.colors.white, padding: '15px', textAlign: 'left', fontSize: '0.9rem', textTransform: 'uppercase' },
  td: { padding: '15px', borderBottom: `1px solid ${theme.colors.border}`, color: theme.colors.gray }
};

// --- COMPONENTES ---

function App() {
  const [hondas, setHondas] = useState([]);
  const [busca, setBusca] = useState('');
  const [view, setView] = useState('front');
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [visiveis, setVisiveis] = useState(9);

  // Carregar dados e verificar sessão
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await axios.get(API_URL);
        setHondas(res.data.carros || []);
      } catch (err) { console.error("Erro API:", err); }
    };
    
    // Verificar localStorage com segurança
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao ler user local", e);
      }
    }

    carregarDados();
  }, []);

  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setVisiveis(prev => prev + 6);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setVisiveis(9); }, [busca]);

  // Ações
  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('user');
    setView('front');
  };

  const adicionarAoCarrinho = (carro) => {
    if (carrinho.find(x => x.id === carro.id)) return alert("Veículo já selecionado.");
    setCarrinho([...carrinho, carro]);
    alert("Adicionado ao carrinho.");
  };

  const removerDoCarrinho = (id) => setCarrinho(carrinho.filter(x => x.id !== id));

  const finalizarReserva = () => {
    if (carrinho.length === 0) return;
    const novaReserva = {
      data: new Date().toLocaleString(),
      cliente: usuario ? usuario.username : "Convidado",
      email: usuario ? usuario.email : "N/A",
      itens: [...carrinho]
    };
    setReservas([...reservas, novaReserva]);
    setCarrinho([]);
    alert("Reserva confirmada. Entraremos em contacto brevemente.");
    setView('front');
  };

  // Renderização condicional
  const renderContent = () => {
    if (view === 'admin') return <AdminArea usuario={usuario} setUsuario={setUsuario} hondas={hondas} setHondas={setHondas} reservas={reservas} />;
    
    if (view === 'carrinho') return (
      <CarrinhoView 
        carrinho={carrinho} 
        remover={removerDoCarrinho} 
        finalizar={finalizarReserva} 
        voltar={() => setView('front')} 
      />
    );

    if (idSelecionado) {
      const carro = hondas.find(h => h.id === idSelecionado);
      return <DetalheCarro carro={carro} voltar={() => setIdSelecionado(null)} addCarrinho={adicionarAoCarrinho} />;
    }

    return (
      <Catalogo 
        hondas={hondas} 
        busca={busca} 
        setBusca={setBusca} 
        visiveis={visiveis} 
        selecionar={setIdSelecionado} 
        addCarrinho={adicionarAoCarrinho} 
      />
    );
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navBrand} onClick={() => { setView('front'); setIdSelecionado(null); }} role="button">
          Honda<span style={{color: theme.colors.primary}}>Stand</span>
        </div>
        <div style={styles.navMenu}>
          <button 
            style={view === 'front' ? {...styles.btnNav, ...styles.btnNavActive} : styles.btnNav} 
            onClick={() => { setView('front'); setIdSelecionado(null); }}
          >
            Veículos
          </button>
          
          <button 
            style={view === 'carrinho' ? {...styles.btnNav, ...styles.btnNavActive} : styles.btnNav} 
            onClick={() => { setView('carrinho'); setIdSelecionado(null); }}
          >
            Carrinho ({carrinho.length})
          </button>
          
          <button 
            style={view === 'admin' ? {...styles.btnNav, ...styles.btnNavActive} : styles.btnNav} 
            onClick={() => setView('admin')}
          >
            {usuario ? usuario.username : "Login"}
          </button>
          
          {usuario && (
            <button onClick={handleLogout} style={{...styles.btnNav, borderColor: theme.colors.danger, color: theme.colors.danger}}>
              Sair
            </button>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {renderContent()}
      </main>

      <footer style={{ background: theme.colors.dark, color: '#666', padding: '40px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ fontSize: '0.9rem' }}>&copy; 2026 Stand Honda. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function Catalogo({ hondas, busca, setBusca, visiveis, selecionar, addCarrinho }) {
  const filtrados = hondas.filter(h => h.modelo?.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <div style={styles.header}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: theme.colors.dark }}>A Excelência Move-nos</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Descubra a nossa seleção de veículos premium.</p>
          <input 
            placeholder="Pesquisar modelo..." 
            onChange={e => setBusca(e.target.value)} 
            style={{ ...styles.input, maxWidth: '400px', padding: '15px', borderRadius: '30px', textAlign: 'center' }} 
          />
        </div>

      <div style={styles.grid}>
        {filtrados.slice(0, visiveis).map(h => (
          <div key={h.id} style={styles.card}>
            <div style={{ height: '200px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => selecionar(h.id)}>
              <img src={h.fotourl || h.fotoUrl} alt={h.modelo} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' }} />
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: theme.colors.dark }}>{h.modelo}</h3>
              <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 20px 0' }}>{h.ano}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => selecionar(h.id)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Detalhes</button>
                <button onClick={() => addCarrinho(h)} style={{ flex: 1, padding: '10px', background: theme.colors.dark, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reservar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visiveis < filtrados.length && <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>A carregar mais...</div>}
    </div>
  );
}

function DetalheCarro({ carro, voltar, addCarrinho }) {
  if (!carro) return null;
  // 
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
      <button onClick={voltar} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}>&larr; Voltar ao Stand</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <img src={carro.fotourl || carro.fotoUrl} alt={carro.modelo} style={{ width: '100%', borderRadius: '4px', objectFit: 'cover' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: theme.colors.primary }}>{carro.modelo}</h1>
          <h3 style={{ color: '#555', margin: '0 0 20px 0' }}>Edição de {carro.ano}</h3>
          
          <div style={{ lineHeight: '1.6', color: '#444', marginBottom: '30px', flex: 1 }}>
            {carro.descricao || carro.descrição || "Sem descrição disponível."}
          </div>
          
          <button onClick={() => addCarrinho(carro)} style={styles.btnPrimary}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

function CarrinhoView({ carrinho, remover, finalizar, voltar }) {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '20px' }}>
      <h2 style={{ fontSize: '2rem', borderBottom: `2px solid ${theme.colors.primary}`, paddingBottom: '10px', marginBottom: '30px' }}>O seu Carrinho</h2>
      
      {carrinho.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#999', fontSize: '1.2rem' }}>O carrinho está vazio.</p>
          <button onClick={voltar} style={{ marginTop: '20px', ...styles.btnPrimary, background: theme.colors.gray }}>Voltar ao Catálogo</button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          {carrinho.map((item, idx) => (
            <div key={`${item.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee' }}>
              <img src={item.fotourl || item.fotoUrl} alt={item.modelo} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '20px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{item.modelo}</h4>
                <small style={{ color: '#888' }}>{item.ano}</small>
              </div>
              <button onClick={() => remover(item.id)} style={{ color: theme.colors.danger, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remover</button>
            </div>
          ))}
          <div style={{ padding: '30px', textAlign: 'right', background: '#fafafa' }}>
            <button onClick={finalizar} style={styles.btnPrimary}>Confirmar Reserva</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminArea({ usuario, setUsuario, hondas, setHondas, reservas }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formUser, setFormUser] = useState({ user: '', password: '', email: '' });

  // LOGIN / REGISTO
  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // Login
      try {
        const res = await axios.get(API_USERS);
        const users = res.data.users || [];
        const userFound = users.find(u => u.username === formUser.user && String(u.password) === String(formUser.password));
        
        if (userFound) {
          setUsuario(userFound);
          localStorage.setItem('user', JSON.stringify(userFound)); // CORREÇÃO JSON
        } else {
          alert("Credenciais inválidas.");
        }
      } catch { alert("Erro de conexão."); }
    } else {
      // Registo
      try {
        const resUsers = await axios.get(API_USERS);
        if (resUsers.data.users?.some(u => u.username === formUser.user)) return alert("Utilizador já existe.");
        
        // Payload corrigido para Sheety
        const payload = { user: { username: formUser.user, password: formUser.password, email: formUser.email, admin: 0 } };
        await axios.post(API_USERS, payload);
        alert("Conta criada. Faça login.");
        setIsLogin(true);
        setFormUser({ user: '', password: '', email: '' });
      } catch { alert("Erro no registo."); }
    }
  };

  if (!usuario) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: theme.colors.primary, marginBottom: '20px' }}>{isLogin ? 'Aceder' : 'Criar Conta'}</h2>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLogin && (
              <input type="email" placeholder="Email" required value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} style={styles.input} />
            )}
            <input type="text" placeholder="Username" required value={formUser.user} onChange={e => setFormUser({...formUser, user: e.target.value})} style={styles.input} />
            <input type="password" placeholder="Password" required value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} style={styles.input} />
            <button type="submit" style={styles.btnPrimary}>{isLogin ? 'Entrar' : 'Registar'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
            <span onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: theme.colors.primary, textDecoration: 'underline' }}>
              {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (Number(usuario.admin) !== 1) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1>Bem-vindo, {usuario.username}.</h1>
        <p style={{ color: '#666' }}>A sua conta não tem privilégios de administrador.</p>
        <button onClick={() => setUsuario(null)} style={{ ...styles.btnPrimary, background: theme.colors.gray, marginTop: '20px' }}>Sair</button>
      </div>
    );
  }

  return <Backoffice hondas={hondas} setHondas={setHondas} reservas={reservas} />;
}

function Backoffice({ hondas, setHondas, reservas }) {
  const [form, setForm] = useState({ modelo: '', ano: '', descricao: '', fotourl: '' });
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { carro: { ...form, ano: String(form.ano) } };
    
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, payload);
        setHondas(prev => prev.map(h => h.id === editId ? { ...h, ...payload.carro, id: editId } : h));
        alert("Atualizado.");
      } else {
        const res = await axios.post(API_URL, payload);
        setHondas(prev => [...prev, res.data.carro]);
        alert("Criado.");
      }
      setForm({ modelo: '', ano: '', descricao: '', fotourl: '' });
      setEditId(null);
    } catch { alert("Erro ao salvar."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que deseja eliminar este veículo?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setHondas(prev => prev.filter(h => h.id !== id));
    } catch { alert("Erro ao eliminar."); }
  };

  const preencherEdicao = (carro) => {
    setEditId(carro.id);
    setForm({ modelo: carro.modelo, ano: carro.ano, descricao: carro.descricao || carro.descrição, fotourl: carro.fotourl || carro.fotoUrl });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* RESERVAS */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ borderBottom: `2px solid ${theme.colors.gray}`, paddingBottom: '10px' }}>Reservas Recentes</h2>
        {reservas.length === 0 ? <p style={{ color: '#999' }}>Sem reservas pendentes.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {reservas.map((res, i) => (
              <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '4px', border: '1px solid #ddd' }}>
                <strong>{res.cliente}</strong> <br/>
                <small>{res.email}</small>
                <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }}/>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {res.itens.map((c, idx) => <li key={idx}>{c.modelo} ({c.ano})</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GESTÃO */}
      <h2 style={{ borderBottom: `2px solid ${theme.colors.primary}`, paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Gestão de Inventário
        {editId && <button onClick={() => {setEditId(null); setForm({ modelo: '', ano: '', descricao: '', fotourl: '' });}} style={styles.btnDanger}>Cancelar Edição</button>}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', display: 'grid', gap: '15px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} required style={styles.input} />
          <input placeholder="Ano" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} required style={styles.input} />
        </div>
        <input placeholder="URL da Imagem" value={form.fotourl} onChange={e => setForm({...form, fotourl: e.target.value})} required style={styles.input} />
        <textarea placeholder="Descrição" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} required style={{ ...styles.input, height: '100px', fontFamily: 'inherit' }} />
        <button type="submit" style={editId ? {...styles.btnPrimary, background: theme.colors.dark} : styles.btnPrimary}>
          {editId ? "Atualizar Veículo" : "Adicionar Novo Veículo"}
        </button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Modelo</th>
            <th style={styles.th}>Ano</th>
            <th style={{...styles.th, textAlign: 'center'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {hondas.map(h => (
            <tr key={h.id}>
              <td style={styles.td}><strong>{h.modelo}</strong></td>
              <td style={styles.td}>{h.ano}</td>
              <td style={{...styles.td, textAlign: 'center'}}>
                <button onClick={() => preencherEdicao(h)} style={{ ...styles.btnNav, marginRight: '10px', color: theme.colors.dark }}>Editar</button>
                <button onClick={() => handleDelete(h.id)} style={styles.btnDanger}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;