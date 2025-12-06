import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

type Product = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category: string;
  expirationDate?: string;
};

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", image: "", price: "", category: "", expirationDate: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", image: "", price: "", category: "", expirationDate: "" });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const load = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/products", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao buscar produtos");
        return r.json();
      })
      .then((data) => setProducts(data))
      .catch((e) => console.error(e));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    if (!form.name || !form.price || !form.category) {
      alert("Nome, preço e categoria são obrigatórios");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', String(Number(form.price)));
    formData.append('category', form.category);
    if (form.description) formData.append('description', form.description);
    if (form.expirationDate) formData.append('expirationDate', form.expirationDate);
    // prefer file upload; fallback to provided URL
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (form.image) {
      formData.append('image', form.image);
    }

    fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then((r) => {
        if (!r.ok) return r.json().then(j => Promise.reject(j));
        return r.json();
      })
      .then((p) => { setProducts(prev => [...prev, p]); setForm({ name: "", description: "", image: "", price: "", category: "", expirationDate: "" }); setImageFile(null); })
      .catch((e) => console.error("Erro ao criar produto:", e));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Confirma exclusão deste produto?")) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao deletar");
        setProducts(prev => prev.filter(p => p._id !== id));
      })
      .catch((e) => console.error(e));
  };

  const startEdit = (p: Product) => {
    setEditingId(p._id);
    setEditForm({
      name: p.name || "",
      description: p.description || "",
      image: p.image || "",
      price: String(p.price || ""),
      category: p.category || "",
      expirationDate: p.expirationDate ? new Date(p.expirationDate).toISOString().slice(0,10) : ""
    });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", description: "", image: "", price: "", category: "", expirationDate: "" });
    setEditImageFile(null);
  };

  const saveEdit = (id: string) => {
    if (!editForm.name || !editForm.price || !editForm.category) {
      alert("Nome, preço e categoria são obrigatórios");
      return;
    }
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append('name', editForm.name);
    fd.append('price', String(Number(editForm.price)));
    fd.append('category', editForm.category);
    if (editForm.description) fd.append('description', editForm.description);
    if (editForm.expirationDate) fd.append('expirationDate', editForm.expirationDate);
    if (editImageFile) {
      fd.append('image', editImageFile);
    } else if (editForm.image) {
      fd.append('image', editForm.image);
    }

    fetch(`http://localhost:3000/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
      .then(r => { if (!r.ok) return r.json().then(j => Promise.reject(j)); return r.json(); })
      .then((updated: Product) => {
        setProducts(prev => prev.map(p => p._id === id ? updated : p));
        cancelEdit();
      })
      .catch(e => console.error('Erro ao atualizar produto:', e));
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
          <h2 className="admin-header-title">Gerenciar Produtos</h2>
        </div>
        <div className="admin-header-right">
          <button className="admin-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <div className="admin-section">
        <h2>Adicionar Produto</h2>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
          <small style={{ display: 'block', marginTop: 6, marginBottom: 6 }}>Ou cole uma URL de imagem (fallback)</small>
          <input placeholder="URL da imagem (opcional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <input placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label style={{ display: 'block', marginBottom: 6 }}>Data de validade</label>
          <input type="date" aria-label="Data de validade" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />
          <button type="submit">Criar</button>
        </form>
      </div>

      <div className="admin-section">
        <h2>Produtos</h2>
        <ul className="admin-list">
          {products.map((p) => (
            <li key={p._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 80, height: 60, background: '#f3f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, overflow: 'hidden' }}>
                {p.image ? <img src={p.image.startsWith('http') ? p.image : `http://localhost:3000${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ color: '#9aa6b2' }}>Sem imagem</div>}
              </div>
              <div style={{ flex: 1 }}>
                {editingId === p._id ? (
                  <div>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <input value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                    <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    <input type="date" value={editForm.expirationDate} onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })} />
                    <input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                    <small style={{ display: 'block', marginTop: 6, marginBottom: 6 }}>Ou cole uma URL de imagem (fallback)</small>
                    <input placeholder="URL da imagem (opcional)" value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} />
                    <div className="admin-actions">
                      <button onClick={() => saveEdit(p._id)}>Salvar</button>
                      <button onClick={cancelEdit}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong>{p.name}</strong> — R$ {p.price} — {p.category} {p.expirationDate ? `— Validade: ${new Date(p.expirationDate).toLocaleDateString()}` : ''}
                    <div>{p.description}</div>
                  </div>
                )}
              </div>
              <div className="admin-actions">
                {editingId !== p._id && (
                  <>
                    <button onClick={() => startEdit(p)}>Editar</button>
                    <button onClick={() => handleDelete(p._id)}>Excluir</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}