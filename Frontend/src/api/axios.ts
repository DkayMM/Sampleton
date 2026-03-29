import axios from 'axios';

// Creamos una instancia de axios pre-configurada
const api = axios.create({
    baseURL: 'http://localhost:8000/api/', // La ruta base de Django
});

export default api;