import { useNavigate } from "react-router-dom";
import "./Admin.css";

type Props = { title?: string };

export default function AdminHeader({ title }: Props) {
  const navigate = useNavigate();

  function handleLogout() {
    if (confirm("Deseja realmente sair do sistema?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }

  return (
    <header className="admin-header-bar">
      <div className="admin-header-left">
        <h2 className="admin-header-title">{title || "Painel Administrativo"}</h2>
      </div>
      <div className="admin-header-right">
        <button className="admin-logout" onClick={handleLogout}>Sair</button>
      </div>
    </header>
  );
}
