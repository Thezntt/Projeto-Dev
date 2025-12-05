import './SignUp.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SignUp() {
    const navigation = useNavigate();
    const sendRequest = async (e: any) => {
        e.preventDefault();
        
    const response = await fetch('http://localhost:3000/api/user/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: username, email: email, password: password, cpf: cpf }
    ),
    })
        if (response.ok) {
            navigation("/login");
        } else {
      const data = await response.json().catch(() => null);
      alert(data?.message || "User creation failed. Please try again.");
        }
    }

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');

    return (
      <div className='signup-page'>
        <div className='signup-container'>
          <div className='left-container'>
            <h1>Join Us!</h1>
            <form id='form-signup' onSubmit={(event) => {sendRequest(event)}}>
              <input onChange={(e) => {setUsername(e.target.value)}}type="text" name="username" placeholder='Enter your username'/>
              <input onChange={(e) => {setEmail(e.target.value)}} type="email" name="email" placeholder='Enter your email'/>
              <input onChange={(e) => {setPassword(e.target.value)}} type="password" name="password" placeholder='Enter your password'/>
              <input onChange={(e) => {setCpf(e.target.value)}} type="text" name="cpf" placeholder='Enter your CPF' />
              <button type="submit">Register</button>
            </form>
          </div>
          <div className='right-container'>
            <h1>Already have an account?</h1>
            <p>Click the button below to Log in!</p>
            <button type="button" onClick={() => navigation('/login')}>Log In</button>
          </div>
        </div>
      </div>
    )
};