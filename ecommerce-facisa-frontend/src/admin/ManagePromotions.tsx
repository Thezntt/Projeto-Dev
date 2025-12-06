import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

type Product = { _id: string; name: string };
type User = { _id?: string; username: string; email: string; cpf?: string };
type Promotion = {
  _id: string;
  productId: Product | string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  targetPreferences?: string[];
  targetUserIds?: User[] | string[];
};

export default function ManagePromotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [form, setForm] = useState({ productId: "", discountPercentage: "", startDate: "", endDate: "", targetPreferences: "", targetUserIds: [] as string[] });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

  const loadAll = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/promotions", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error('Erro'); return r.json(); })
      .then((data) => setPromotions(data))
      .catch((e) => console.error(e));

    fetch("http://localhost:3000/api/products", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch((e) => console.error(e));

    fetch("http://localhost:3000/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch((e) => console.error(e));
  };

  useEffect(() => { loadAll(); }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!showUserDropdown) return;
      const target = e.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, [showUserDropdown]);

  const handleCreate = () => {
    if (!form.productId || !form.discountPercentage || !form.startDate || !form.endDate) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    const token = localStorage.getItem('token');
    const payload = {
      productId: form.productId,
      discountPercentage: Number(form.discountPercentage),
      startDate: form.startDate,
      endDate: form.endDate,
      targetPreferences: form.targetPreferences ? form.targetPreferences.split(',').map(s => s.trim()).filter(Boolean) : [],
      targetUserIds: form.targetUserIds
    };

    fetch('http://localhost:3000/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
      .then((r) => { if (!r.ok) return r.json().then(j => Promise.reject(j)); return r.json(); })
      .then((p) => { setPromotions(prev => [...prev, p]); setForm({ productId: '', discountPercentage: '', startDate: '', endDate: '', targetPreferences: '', targetUserIds: [] }); })
      .catch((e) => console.error('Erro ao criar promoção', e));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Confirma exclusão desta promoção?')) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/api/promotions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error('Erro'); setPromotions(prev => prev.filter(p => p._id !== id)); })
      .catch((e) => console.error(e));
  };

  const toggleAssign = (promotionId: string, userId: string) => {
    const promo = promotions.find(p => p._id === promotionId);
    if (!promo) return;
    // build array of ids
    const currentIds: string[] = Array.isArray(promo.targetUserIds) ? promo.targetUserIds.map((u:any) => typeof u === 'string' ? u : u._id) : [];
    const exists = currentIds.includes(userId);
    const updated = exists ? currentIds.filter(id => id !== userId) : [...currentIds, userId];
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/api/promotions/${promotionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetUserIds: updated })
    })
      .then((r) => { if (!r.ok) return r.json().then(j => Promise.reject(j)); return r.json(); })
      .then((p) => { setPromotions(prev => prev.map(item => item._id === promotionId ? p : item)); })
      .catch((e) => console.error('Erro ao atualizar promoção', e));
  };

  function handleLogout() {
    if (confirm("Deseja realmente sair do sistema?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="admin-back" onClick={() => navigate('/admin/dashboard')}>Voltar</button>
          <h2 className="admin-header-title">Gerenciar Promoções</h2>
        </div>
        <div className="admin-header-right">
          <button className="admin-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <div className="admin-section">
        <h2>Criar Promoção</h2>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
            <option value="">-- Selecionar produto --</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input placeholder="Desconto (%)" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} required />
          <label style={{ display: 'block', marginBottom: 6 }}>Data de início</label>
          <input type="date" aria-label="Data de início" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          <label style={{ display: 'block', marginTop: 8, marginBottom: 6 }}>Data de término</label>
          <input type="date" aria-label="Data de término" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          <input placeholder="Preferências alvo (ex: comida,eletrônicos)" value={form.targetPreferences} onChange={(e) => setForm({ ...form, targetPreferences: e.target.value })} />
          <div>
            <label> Atribuir a usuários (opcional):</label>
            <div style={{ position: 'relative' }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowUserDropdown(s => !s)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowUserDropdown(s => !s); }}
                className="multiselect-control"
                style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', minWidth: 220 }}
              >
                {form.targetUserIds.length > 0 ? `${form.targetUserIds.length} usuário(s) selecionado(s)` : 'Selecionar usuários'}
              </div>

              {showUserDropdown && (
                <div ref={userDropdownRef} className="multiselect-options" style={{ position: 'absolute', zIndex: 50, background: '#fff', border: '1px solid #ddd', borderRadius: 6, marginTop: 6, maxHeight: 200, overflow: 'auto', padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {users.map(u => (
                    <div key={u.email} className="multiselect-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px' }}>
                      <div style={{ marginRight: 8 }}>{u.username} ({u.email})</div>
                      <input
                        type="checkbox"
                        checked={form.targetUserIds.includes(u._id || '')}
                        onChange={(e) => {
                          const ids = [...form.targetUserIds];
                          const id = u._id || '';
                          if (e.target.checked) {
                            if (!ids.includes(id)) ids.push(id);
                          } else {
                            const idx = ids.indexOf(id);
                            if (idx >= 0) ids.splice(idx, 1);
                          }
                          setForm({ ...form, targetUserIds: ids });
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <button type="button" onClick={() => setShowUserDropdown(false)}>Fechar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button type="submit">Criar Promoção</button>
        </form>
      </div>

      <div className="admin-section">
        <h2>Promoções</h2>
        <ul className="admin-list">
          {promotions.map(p => (
            <li key={p._id}>
              <div>
                <div><strong>Produto:</strong> {typeof p.productId === 'string' ? p.productId : (p.productId as any).name}</div>
                <div><strong>Desconto:</strong> {p.discountPercentage}%</div>
                <div><strong>Validade:</strong> {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}</div>
                <div><strong>Preferências alvo:</strong> {(p.targetPreferences || []).join(', ')}</div>
              </div>
              <div className="admin-actions">
                <button onClick={() => handleDelete(p._id)}>Excluir</button>
              </div>
              <details>
                <summary>Gerenciar Atribuições</summary>
                <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
                  {users.map(u => {
                    const assignedIds = Array.isArray(p.targetUserIds) ? p.targetUserIds.map((x:any)=> typeof x === 'string' ? x : x._id) : [];
                    const checked = assignedIds.includes(u._id || '');
                    return (
                      <label key={u.email} style={{ display: 'block' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleAssign(p._id, u._id || '')} /> {u.username} ({u.email})
                      </label>
                    );
                  })}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}