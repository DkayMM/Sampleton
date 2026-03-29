import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import api from '../api/axios';

const Register = () => {
    // 1. MEMORIA DE LOS VALORES
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [globalError, setGlobalError] = useState('');

    // 2. MEMORIA DE LOS ERRORES (En tiempo real)
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const navigate = useNavigate();

    // EXPRESIONES REGULARES
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // 3. FUNCIÓN VALIDADORA (Se ejecuta al salir del campo - onBlur)
    const validarCampo = (campo: string, valor: string) => {
        let mensaje = '';
        
        switch (campo) {
            case 'username':
                if (valor.trim() === '') mensaje = 'El nombre de usuario es obligatorio.';
                break;
            case 'email':
                if (!emailRegex.test(valor)) mensaje = 'Introduce un correo válido (ej: usuario@dominio.com).';
                break;
            case 'password':
                if (!passwordRegex.test(valor)) mensaje = 'Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.';
                break;
            case 'confirmPassword':
                if (valor !== password) mensaje = 'Las contraseñas no coinciden.';
                break;
        }

        // Actualizamos el error solo de este campo específico
        setFieldErrors(prev => ({ ...prev, [campo]: mensaje }));
        return mensaje === ''; // Devuelve true si es válido
    };

    // 4. FUNCIÓN AL ENVIAR FORMULARIO
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        setGlobalError('');

        // Forzamos validación de todos los campos antes de enviar
        const usernameValido = validarCampo('username', username);
        const emailValido = validarCampo('email', email);
        const passwordValido = validarCampo('password', password);
        const confirmValido = validarCampo('confirmPassword', confirmPassword);

        // Si alguno falla, paramos el envío
        if (!usernameValido || !emailValido || !passwordValido || !confirmValido) {
            return; 
        }
        
        try {
            await api.post('register/', {
                username: username,
                email: email,
                password: password
            });
            
            alert("¡Cuenta creada con éxito!");
            navigate('/login'); 
            
        } catch (err) {
            setGlobalError('Error al registrar. Puede que el usuario o email ya existan.');
        }
    };

    // 5. DISEÑO (Añadido condicionales para bordes rojos y mensajes)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans text-black">
            
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-black rounded flex items-center justify-center border border-black">
                    <div className="w-8 h-8 rounded-full border-2 border-white"></div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">SAMPLETON</h1>
            </div>

            <div className="bg-white p-10 border border-black w-[400px] shadow-sm">
                
                <h2 className="text-3xl font-bold mb-8">Register</h2>
                
                {/* Error global (del backend) */}
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
                                setFieldErrors(prev => ({ ...prev, username: '' })); // Limpia error al escribir
                            }}
                            onBlur={(e) => validarCampo('username', e.target.value)} // Valida al salir
                            className={`p-3 rounded border text-sm focus:outline-none focus:ring-1 ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-black'} bg-gray-50`}
                        />
                        {/* Mensaje de error individual */}
                        {fieldErrors.username && <span className="text-red-500 text-xs">{fieldErrors.username}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-sm">Email</label>
                        <input 
                            type="email" 
                            placeholder="Enter email" 
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setFieldErrors(prev => ({ ...prev, email: '' }));
                            }}
                            onBlur={(e) => validarCampo('email', e.target.value)}
                            className={`p-3 rounded border text-sm focus:outline-none focus:ring-1 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-black'} bg-gray-50`}
                        />
                        {fieldErrors.email && <span className="text-red-500 text-xs">{fieldErrors.email}</span>}
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

                    <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-sm">Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="Confirm password" 
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }}
                            onBlur={(e) => validarCampo('confirmPassword', e.target.value)}
                            className={`p-3 rounded border text-sm focus:outline-none focus:ring-1 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-black'} bg-gray-50`}
                        />
                        {fieldErrors.confirmPassword && <span className="text-red-500 text-xs">{fieldErrors.confirmPassword}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 mt-4 transition-colors text-sm"
                    >
                        Create Account
                    </button>
                </form>

                <div className="text-center mt-6 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold hover:underline">
                        Log In
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

export default Register;