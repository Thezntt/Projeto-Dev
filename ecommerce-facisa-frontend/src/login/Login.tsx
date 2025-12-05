import { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigation = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const sendRequest = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });


            const data = await response.json();

            if (response.ok) {
                const token = data.token || (typeof data === 'string' ? data : null);

                if (token) {
                    console.log("Token salvo:", token); 
                    localStorage.setItem("token", token); 
                    navigation("/home");
                } else {
                    alert("Erro: Login autorizado, mas nenhum token foi recebido.");
                }
            } else {
                alert(data.message || data.error || "Login falhou. Verifique suas credenciais.");
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Não foi possível conectar ao servidor.");
        }
    }

    const registerUser = () => {
        navigation("/signup");
    }

    return (
        <div className='login-page'>
            <div className='login-container'>
                <div className='left-container'>
                    <h1>Hello!</h1>
                    <form id='form-login' onSubmit={(event) => { sendRequest(event) }}>
                        <input 
                            onChange={(e) => { setEmail(e.target.value) }} 
                            type="text" 
                            name="email" 
                            placeholder='Enter your email' 
                            required 
                        />
                        <input 
                            onChange={(e) => { setPassword(e.target.value) }} 
                            type="password" 
                            name="password" 
                            placeholder='Enter your password' 
                            required 
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>
                <div className='right-container'>
                    <h1>Welcome Back!</h1>
                    <p>Not yet registered? Click the button below to Sign in!</p>
                    <button type="button" onClick={() => registerUser()}>Sign In</button>
                </div>
            </div>
        </div>
    )
};