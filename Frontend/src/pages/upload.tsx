import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Upload = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState(''); 
    const [genre, setGenre] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('audio/')) {
                setAudioFile(file);
                setError('');
            } else {
                setAudioFile(null);
                setError('Por favor, selecciona un audio válido (.mp3, .wav).');
            }
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!audioFile) {
            setError('Debes subir el archivo de audio (Sample).');
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('artist', artist);
            formData.append('genre', genre || 'Other');
            formData.append('audio_file', audioFile);
            if (coverFile) formData.append('cover_image', coverFile);

            const token = localStorage.getItem('access');
            await api.post('tracks/', formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data'}
            });
            alert('¡Canción subida con éxito!');
            navigate('/'); 
        } catch (err) {
            setError('Error al subir la canción. Revisa tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-8 mt-4">
            <h1 className="text-3xl font-bold mb-8">Upload Sample</h1>
            {error && <p className="text-red-600 bg-red-100 p-3 rounded text-sm mb-6 border border-red-300 font-bold">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="relative border-2 border-dashed border-gray-400 py-16 px-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-sm cursor-pointer group">
                    {audioFile ? (
                        <div className="text-xl font-bold text-green-600 flex flex-col items-center gap-2">
                            <span>✅ Archivo seleccionado:</span>
                            <span className="text-black">{audioFile.name}</span>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 border-2 border-black flex items-center justify-center mb-6 bg-white group-hover:scale-105 transition-transform"><span className="text-3xl">↑</span></div>
                            <div className="h-4 bg-gray-300 w-64 mb-3 rounded-sm"></div>
                            <div className="h-4 bg-gray-200 w-48 mb-8 rounded-sm"></div>
                            <div className="bg-black text-white font-bold py-2 px-8 text-sm cursor-pointer">Choose File</div>
                        </>
                    )}
                    <input type="file" accept="audio/*" onChange={handleAudioChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Sample Title *</label>
                        <input type="text" placeholder="Enter sample title" value={title} onChange={(e) => setTitle(e.target.value)} className="p-3 rounded border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-black" required/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Artist Name *</label>
                        <input type="text" placeholder="Enter artist name" value={artist} onChange={(e) => setArtist(e.target.value)} className="p-3 rounded border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-black" required/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Genre *</label>
                        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="p-3 rounded border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-black appearance-none cursor-pointer" required>
                            <option value="" disabled>Select a genre</option>
                            <option value="Lo-Fi">Lo-Fi</option><option value="Electronic">Electronic</option>
                            <option value="Hip-Hop">Hip-Hop</option><option value="Rock">Rock</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-sm">Cover Image</label>
                        <div className="relative border-2 border-dashed border-gray-400 w-32 h-32 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                            {coverFile ? <span className="text-xs font-bold text-center p-2 break-all">{coverFile.name}</span> : <span className="text-gray-400 text-sm">Upload</span>}
                            <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        </div>
                    </div>
                </div>
                <div className="pt-4 pb-12">
                    <button type="submit" disabled={isLoading} className={`bg-black text-white font-bold py-3 px-8 text-sm transition-colors border border-black ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'}`}>
                        {isLoading ? 'Uploading...' : 'Publish Sample'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Upload;