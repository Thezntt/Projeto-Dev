import { Link } from "react-router-dom";
import "./Admin.css";
import AdminHeader from "./AdminHeader";

export default function AdminDashboard() {
  return (
    <div className="admin-page">
      <AdminHeader title="Painel Administrativo" />

      <div className="admin-dashboard">
        <div className="admin-actions-grid">
          <Link to="/admin/users" className="admin-card" aria-label="Gerenciar Usuários">
            <div className="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="card-label">Gerenciar Usuários</div>
          </Link>

          <Link to="/admin/products" className="admin-card" aria-label="Gerenciar Produtos">
            <div className="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M3 7.5L12 3l9 4.5v8.999A2.001 2.001 0 0 1 18 19.5L12 22l-6-2.5A2 2 0 0 1 3 16.5V7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3v13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="card-label">Gerenciar Produtos</div>
          </Link>

          <Link to="/admin/promotions" className="admin-card" aria-label="Gerenciar Promoções">
            <div className="card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M20.59 13.41L11 3 3 11l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className="card-label">Gerenciar Promoções</div>
          </Link>
        </div>
      </div>
    </div>
  );
}