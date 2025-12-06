import './SignUp.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SignUp() {
    const navigation = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);

    const sendRequest = async (e: any) => {
        e.preventDefault();
        // validação simples do CPF (aceita com ou sem formatação)
        const cpfDigits = cpf.replace(/\D/g, '');
        if (cpfDigits.length !== 11) {
            alert('CPF inválido. Informe 11 dígitos.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/user/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, cpf }),
            });

            if (response.ok) {
                navigation('/login');
            } else {
                const data = await response.json().catch(() => null);
                alert(data?.message || 'Falha ao criar usuário.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="login-card">
                <div className="brand-panel">
                    <div className="brand-icon" aria-hidden>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="10" cy="20" r="1" fill="#ffffff"/>
                            <circle cx="18" cy="20" r="1" fill="#ffffff"/>
                        </svg>
                    </div>
                    <h2 className="brand-title">Supermercado Array</h2>
                    <p className="brand-sub">Crie sua conta e aproveite ofertas</p>
                </div>

                <div className="form-panel">
                    <h3>Registrar</h3>
                    <form className="form" onSubmit={sendRequest}>
                        <label className="input-label">Nome de usuário</label>
                        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu nome" />

                        <label className="input-label">E-mail</label>
                        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@exemplo.com" />

                        <label className="input-label">Senha</label>
                        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

                        <label className="input-label">CPF</label>
                        <input className="input" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="00000000000" />

                        <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Registrar'}</button>
                    </form>

                    <div className="alt-actions">
                        <span>Já tem conta?</span>
                        <button className="link-btn" onClick={() => navigation('/login')}>Entrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}