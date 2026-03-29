import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    // 1. MEMORIA DE LOS VALORES
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [globalError, setGlobalError] = useState('');

    // 2. MEMORIA DE ERRORES (En tiempo real)
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        password: ''
    });
    
    const navigate = useNavigate();

    // 3. VALIDACIÓN BÁSICA (Solo comprobamos que no estén vacíos)
    const validarCampo = (campo: string, valor: string) => {
        let mensaje = '';
        if (valor.trim() === '') {
            mensaje = 'Este campo es obligatorio.';
        }
        setFieldErrors(prev => ({ ...prev, [campo]: mensaje }));
        return mensaje === '';
    };

    // 4. FUNCIÓN AL ENVIAR FORMULARIO
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setGlobalError('');

        const usernameValido = validarCampo('username', username);
        const passwordValido = validarCampo('password', password);

        if (!usernameValido || !passwordValido) return; 
        
        try {
            // Llamamos a la taquilla de Django (el endpoint que configuramos ayer)
            const response = await api.post('token/', {
                username: username,
                password: password
            });
            
            // 🚨 ¡LA MAGIA DEL LOGIN! Guardamos las "pulseras VIP" en el navegador
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            
            // Si todo va bien, lo mandamos a la página principal (la crearemos luego)
            navigate('/'); 
            
        } catch (err) {
            // Si Django devuelve un error 401 (No autorizado)
            setGlobalError('Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        }
    };

    // 5. DISEÑO (Hermano gemelo del Registro)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans text-black">
            
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-black rounded flex items-center justify-center border border-black">
                    <div className="w-8 h-8 rounded-full border-2 border-white"></div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">SAMPLETON</h1>
            </div>

            <div className="bg-white p-10 border border-black w-[400px] shadow-sm">
                
                <h2 className="text-3xl font-bold mb-8">Log In</h2>
                
                {globalError && <p className="text-red-600 bg-red-100 p-2 rounded text-sm mb-6 text-center">{globalError}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-sm">Username</label>
                        <input 
                            type="text" 
                            placeholder="Enter username" 
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setFieldErrors(prev => ({ ...prev, username: '' }));
                            }}
                            onBlur={(e) => validarCampo('username', e.target.value)}
                            className={`p-3 rounded border text-sm focus:outline-none focus:ring-1 ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-black'} bg-gray-50`}
                        />
                        {fieldErrors.username && <span className="text-red-500 text-xs">{fieldErrors.username}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-sm">Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter password" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setFieldErrors(prev => ({ ...prev, password: '' }));
                            }}
                            onBlur={(e) => validarCampo('password', e.target.value)}
                            className={`p-3 rounded border text-sm focus:outline-none focus:ring-1 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-black'} bg-gray-50`}
                        />
                        {fieldErrors.password && <span className="text-red-500 text-xs">{fieldErrors.password}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 mt-4 transition-colors text-sm"
                    >
                        Log In
                    </button>
                </form>

                <div className="text-center mt-6 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>

            <div className="mt-10 text-center text-sm">
                <Link to="/" className="text-gray-600 hover:text-black hover:underline">
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
};

export default Login;