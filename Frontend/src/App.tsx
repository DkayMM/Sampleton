import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';

function App() {
  return (
    // El Router es el componente padre que envuelve todo para que el "GPS" funcione
    <Router>
      <div className="min-h-screen bg-gray-900 font-sans">
        {/* Aquí dentro definimos todas las rutas posibles de tu web */}
        <Routes>
          
          {/* 1. Ruta base: Si alguien entra a la raíz, por ahora lo redirigimos al Registro */}
          <Route path="/" element={<Navigate to="/register" />} />
          
          {/* 2. Tu nueva pantalla de creación de cuenta */}
          <Route path="/register" element={<Register />} />

          {/* 3. Dejamos el hueco preparado para el Login (lo crearemos en el siguiente paso) */}
          {<Route path="/login" element={<Login />} />}
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
