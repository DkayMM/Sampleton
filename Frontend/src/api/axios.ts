import axios from 'axios';

// Creamos la instancia base (ajusta la URL a la tuya si es diferente)
const api = axios.create({
    baseURL: 'http://localhost:8000/api/', 
});

// 🚨 EL INTERCEPTOR: El guardaespaldas global
api.interceptors.response.use(
    (response) => {
        // Si la respuesta es correcta (Status 200, 201...), dejamos que pase
        return response;
    },
    (error) => {
        // Si Django nos devuelve un error...
        if (error.response && error.response.status === 401 && !error.config.url.includes('token/')) {
            // Un 401 significa que el Token no es válido o ha caducado.
            
            // 1. Limpiamos la memoria corrupta
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            
            // 2. Avisamos al usuario visualmente
            alert("⏳ Tu sesión ha caducado por seguridad. Por favor, vuelve a iniciar sesión.");
            
            // 3. Lo mandamos a la página de Login
            window.location.href = '/login'; 
        }
        
        // Devolvemos el error para que los componentes puedan manejar otros fallos (ej: Error 400 de formulario)
        return Promise.reject(error);
    }
);

export default api;