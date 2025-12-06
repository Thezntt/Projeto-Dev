import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

type User = {
  _id?: string;
  username: string;
  email: string;
  role: string;
  cpf?: string;
};

function validateCPF(cpf: string) {
  if (!cpf) return false;
  const s = cpf.replace(/\D/g, "");
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false;
  const nums = s.split("").map(Number);
  const calc = (slice: number[]) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) sum += slice[i] * (slice.length + 1 - i);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(nums.slice(0, 9));
  const d2 = calc(nums.slice(0, 10));
  return d1 === nums[9] && d2 === nums[10];
}

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user", cpf: "" });
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ username?: string; email?: string; role?: string; cpf?: string; password?: string }>({});

  const loadUsers = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao buscar usuários");
        return r.json();
      })
      .then((data) => setUsers(data))
      .catch((e) => console.error("Erro ao buscar usuários:", e));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = () => {
    if (!validateCPF(newUser.cpf)) {
      alert("CPF inválido");
      return;
    }

    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser),
    })
      .then((response) => {
        if (!response.ok) return response.json().then((j) => Promise.reject(j));
        return response.json();
      })
      .then((data) => {
        setUsers((prev) => [...prev, data]);
        setNewUser({ username: "", email: "", password: "", role: "user", cpf: "" });
      })
      .catch((error) => console.error("Erro ao criar usuário:", error));
  };

  const handleDeleteUser = (email: string) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/api/users/${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao excluir usuário");
        setUsers((prev) => prev.filter((u) => u.email !== email));
      })
      .catch((error) => console.error("Erro ao excluir usuário:", error));
  };

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setEditForm({ username: user.username, email: user.email, role: user.role, cpf: user.cpf });
  };

  const cancelEdit = () => {
    setEditingEmail(null);
    setEditForm({});
  };

  const saveEdit = (originalEmail: string) => {
    if (editForm.cpf && !validateCPF(editForm.cpf)) {
      alert("CPF inválido");
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/api/users/${encodeURIComponent(originalEmail)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editForm),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((j) => Promise.reject(j));
        return r.json();
      })
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.email === originalEmail ? updated : u)));
        cancelEdit();
      })
      .catch((e) => console.error("Erro ao salvar usuário:", e));
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
          <h2 className="admin-header-title">Gerenciar Usuários</h2>
        </div>
        <div className="admin-header-right">
          <button className="admin-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <h2 className="admin-header">Adicionar Novo Usuário</h2>
      <form className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateUser();
        }}
      >
        <input type="text" placeholder="Nome de usuário" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
        <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
        <input type="password" placeholder="Senha" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
        <input type="text" placeholder="CPF (somente números)" value={newUser.cpf} onChange={(e) => setNewUser({ ...newUser, cpf: e.target.value })} required />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Criar Usuário</button>
      </form>

      <h2 className="admin-header">Lista de Usuários</h2>
      <ul className="admin-list">
        {users.map((user) => (
          <li key={user.email}>
            {editingEmail === user.email ? (
              <div>
                <input value={editForm.username || ""} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                <input value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                <input value={editForm.cpf || ""} onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })} placeholder="CPF" />
                <select value={editForm.role || "user"} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
                <input type="password" placeholder="Nova senha (opcional)" onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                <div className="admin-actions">
                  <button onClick={() => saveEdit(user.email)}>Salvar</button>
                  <button onClick={cancelEdit}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                {user.username} ({user.email}) - {user.role} - {user.cpf}
                <div className="admin-actions">
                  <button onClick={() => startEdit(user)}>Editar</button>
                  <button onClick={() => handleDeleteUser(user.email)}>Excluir</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}