import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Home from './pages/home';
import Upload from './pages/upload';
import Layout from './components/layout';
import EditProfile from './pages/editProfile';
import MyLibrary from './pages/myLibrary';
import PlaylistPage from './pages/playlistPage';
import SampleDetails from './pages/sampleDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-black dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
        <Routes>
          
          <Route element={<Layout />}>
             <Route path="/" element={<Home />} />
             <Route path="/upload" element={<Upload />} />
             <Route path="/profile" element={<EditProfile />} />
             <Route path="/library" element={<MyLibrary />} />
             <Route path="/playlist/:id" element={<PlaylistPage />} />
             <Route path="/sample/:id" element={<SampleDetails />} />
          </Route>

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
