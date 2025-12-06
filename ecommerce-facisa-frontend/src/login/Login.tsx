import { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigation = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const sendRequest = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                const token = data.token || (typeof data === 'string' ? data : null);
                if (token) {
                    localStorage.setItem('token', token);
                    const userRole = data.role || 'user';
                    if (userRole === 'admin') navigation('/admin/dashboard');
                    else navigation('/');
                } else {
                    alert('Erro: token não recebido.');
                }
            } else {
                alert(data.message || data.error || 'Login falhou. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    const registerUser = () => navigation('/signup');

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="brand-panel">
                    <div className="brand-icon" aria-hidden>
                        {/* Cart SVG */}
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="10" cy="20" r="1" fill="#ffffff"/>
                            <circle cx="18" cy="20" r="1" fill="#ffffff"/>
                        </svg>
                    </div>
                    <h2 className="brand-title">Supermercado Array</h2>
                    <p className="brand-sub">Entre e aproveite as ofertas</p>
                </div>

                <div className="form-panel">
                    <h3>Faça login</h3>
                    <form className="form" onSubmit={sendRequest}>
                        <label className="input-label">E-mail</label>
                        <input
                            className="input"
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            name="email"
                            placeholder="seu@exemplo.com"
                            required
                        />

                        <label className="input-label">Senha</label>
                        <input
                            className="input"
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />

                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="alt-actions">
                        <span>Não tem conta?</span>
                        <button className="link-btn" onClick={registerUser}>Criar conta</button>
                    </div>
                </div>
            </div>
        </div>
    );
}