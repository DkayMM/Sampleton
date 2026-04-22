import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const EditProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        display_name: '',
        bio: '',
        location: '',
        avatar_file: null as string | null // Aquí guardamos la URL actual de Django
    });

    // Estado para el nuevo archivo que el usuario suba
    const [newAvatar, setNewAvatar] = useState<File | null>(null);

    // 1. CARGAR DATOS AL ENTRAR
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await api.get('profile/me/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFormData({
                    username: response.data.username,
                    email: response.data.email,
                    display_name: response.data.display_name || '',
                    bio: response.data.bio || '',
                    location: response.data.location || '',
                    avatar_file: response.data.avatar_file
                });
            } catch (err) {
                console.error("Error al cargar perfil", err);
                setError('No se pudo cargar el perfil.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // 2. MANEJAR CAMBIO DE FOTO
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewAvatar(e.target.files[0]);
            // Creamos una URL temporal para previsualizar la foto antes de guardarla
            setFormData({ ...formData, avatar_file: URL.createObjectURL(e.target.files[0]) });
        }
    };

    // 3. ENVIAR DATOS A DJANGO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const submitData = new FormData();
            submitData.append('display_name', formData.display_name);
            submitData.append('bio', formData.bio);
            submitData.append('location', formData.location);
            
            // Solo enviamos el archivo si el usuario ha seleccionado uno nuevo
            if (newAvatar) {
                submitData.append('avatar_file', newAvatar);
            }

            const token = localStorage.getItem('access');
            await api.patch('profile/me/', submitData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000); // Ocultar mensaje de éxito tras 3 seg
            
        } catch (err) {
            console.error(err);
            setError("Error al guardar los cambios.");
        }
    };

    if (isLoading) return <div className="p-8 text-center font-bold">Cargando perfil...</div>;

    return (
        <div className="w-full max-w-3xl mx-auto p-8 relative">
            <button 
                onClick={() => navigate('/')} 
                className="absolute top-8 right-8 border-2 border-gray-200 text-gray-400 w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300 transition-all font-bold shadow-sm"
            >
                ✕
            </button>

            <h1 className="text-3xl font-extrabold mb-10 text-gray-800">Edit Profile</h1>

            {error && <p className="text-red-600 bg-red-100 p-3 mb-6 border border-red-300 font-bold">{error}</p>}
            {success && <p className="text-green-700 bg-green-100 p-3 mb-6 border border-green-300 font-bold">¡Perfil actualizado correctamente!</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                
                {/* FOTO DE PERFIL */}
                <div className="flex items-center gap-8">
                    <div className="w-32 h-32 bg-orange-50/50 rounded-full flex-shrink-0 border-2 border-orange-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                        {formData.avatar_file ? (
                            <img src={formData.avatar_file} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl text-gray-400">👤</span>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Cambiar foto de perfil"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <span className="font-bold text-sm">Profile Picture</span>
                        <div className="flex items-center gap-4">
                            <div className="relative border-2 border-orange-500 text-orange-500 rounded-full px-5 py-2 text-sm font-bold hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:text-white hover:border-transparent transition-all shadow-sm cursor-pointer">
                                Upload New Photo
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORMULARIO DE TEXTO */}
                <div className="border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col gap-6 bg-white">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm text-gray-500">Username (Cannot be changed)</label>
                        <input type="text" value={formData.username} disabled className="p-3 bg-gray-200 border border-gray-300 text-sm cursor-not-allowed text-gray-500"/>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm text-gray-500">Email (Cannot be changed)</label>
                        <input type="email" value={formData.email} disabled className="p-3 bg-gray-200 border border-gray-300 text-sm cursor-not-allowed text-gray-500"/>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Display Name</label>
                        <input 
                            type="text" 
                            value={formData.display_name}
                            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                            placeholder="Enter display name" 
                            className="p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Bio</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself..." 
                            rows={4}
                            className="p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800 resize-none"
                        ></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Location</label>
                        <input 
                            type="text" 
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g. Madrid, Spain"
                            className="p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                    </div>
                </div>

                {/* BOTÓN DE GUARDAR */}
                <div className="flex justify-end pb-12">
                    <button type="submit" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl px-10 py-3 font-bold hover:scale-105 hover:shadow-lg transition-all shadow-md">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;