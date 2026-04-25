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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900 font-sans text-black dark:text-zinc-100 transition-colors duration-300 py-12">
            
            <div className="flex items-center gap-2 mb-10">
                <img src="/logo_icon.png" alt="Sampleton" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="font-semibold text-3xl tracking-tighter">
                    <span className="text-black dark:text-white">Sample</span><span className="text-orange-500">ton</span>
                </span>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 md:p-10 rounded-2xl w-[90%] max-w-[400px] shadow-xl border border-gray-100 dark:border-zinc-700 transition-colors duration-300">
                
                <h2 className="text-3xl font-extrabold mb-8 text-gray-800 dark:text-zinc-100">Register</h2>
                
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
                            className={`p-3 rounded-xl border text-sm focus:outline-none focus:ring-0 transition-colors duration-300 ${fieldErrors.username ? 'border-red-500 focus:ring-0' : 'border-gray-200 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0'} bg-gray-50 dark:bg-zinc-900/50 dark:text-white`}
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
                            className={`p-3 rounded-xl border text-sm focus:outline-none focus:ring-0 transition-colors duration-300 ${fieldErrors.email ? 'border-red-500 focus:ring-0' : 'border-gray-200 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0'} bg-gray-50 dark:bg-zinc-900/50 dark:text-white`}
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
                            className={`p-3 rounded-xl border text-sm focus:outline-none focus:ring-0 transition-colors duration-300 ${fieldErrors.password ? 'border-red-500 focus:ring-0' : 'border-gray-200 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0'} bg-gray-50 dark:bg-zinc-900/50 dark:text-white`}
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
                            className={`p-3 rounded-xl border text-sm focus:outline-none focus:ring-0 transition-colors duration-300 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-0' : 'border-gray-200 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-0'} bg-gray-50 dark:bg-zinc-900/50 dark:text-white`}
                        />
                        {fieldErrors.confirmPassword && <span className="text-red-500 text-xs">{fieldErrors.confirmPassword}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:scale-105 hover:shadow-lg text-white font-bold py-3 px-4 mt-4 transition-all shadow-md text-sm rounded-xl"
                    >
                        Create Account
                    </button>
                </form>

                <div className="text-center mt-6 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600 transition-colors hover:underline">
                        Log In
                    </Link>
                </div>
            </div>

            <div className="mt-10 text-center text-sm">
                <Link to="/" className="text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:underline transition-colors">
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
};

export default Register;