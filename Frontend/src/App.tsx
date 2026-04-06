import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Home from './pages/home';
import Upload from './pages/upload';
import Layout from './components/layout';
import EditProfile from './pages/editProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-black bg-white">
        <Routes>
          
          <Route element={<Layout />}>
             <Route path="/" element={<Home />} />
             <Route path="/upload" element={<Upload />} />
             /* Ruta del Perfil - pendiente de crear el componente EditProfile */
             <Route path="/profile" element={<EditProfile />} />
          </Route>

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
