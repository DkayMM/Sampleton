import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/axios';

type ContextType = {
    tracks: any[];
    handlePlayTrack: (track: any) => void;
    currentTrack: any;
    isPlaying: boolean;
};

const TrackDuration = ({ audioUrl }: { audioUrl: string }) => {
    const [duration, setDuration] = useState<string>('--:--');

    useEffect(() => {
        if (!audioUrl) return;
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
            const mins = Math.floor(audio.duration / 60);
            const secs = Math.floor(audio.duration % 60).toString().padStart(2, '0');
            setDuration(`${mins}:${secs}`);
        };
    }, [audioUrl]);

    return <span>{duration}</span>;
};

const PlaylistPage = () => {
    const { id } = useParams(); // Coge el número de la URL (ej: /playlist/1 -> id=1)
    const navigate = useNavigate();
    const { tracks, handlePlayTrack, currentTrack, isPlaying } = useOutletContext<ContextType>();

    const [playlist, setPlaylist] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylist = async () => {
            const token = localStorage.getItem('access'); // 👈 1. Buscamos la pulsera
            
            try {
                // 2. Se la enseñamos a Django en los headers
                const response = await api.get(`playlists/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPlaylist(response.data);
            } catch (error) {
                console.error("Error al cargar la playlist", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchPlaylist();
    }, [id]);

    if (isLoading) return <div className="p-8 font-bold">Cargando playlist...</div>;
    if (!playlist) return <div className="p-8 font-bold text-red-500">No se encontró la playlist.</div>;

    // 🚨 TRUCO NINJA: Cruzamos los IDs de la playlist con los tracks reales de nuestra memoria
    const playlistTracks = playlist.tracks && Array.isArray(playlist.tracks)
        ? Array.from(new Set(playlist.tracks)).map((tid: any) => tracks.find(t => t.id === tid)).filter(Boolean)
        : [];

    const handleRemoveTrack = async (trackIdToRemove: number) => {
        if (!window.confirm("¿Estás seguro de que quieres quitar esta canción de la playlist?")) return;
        try {
            const token = localStorage.getItem('access');
            const newTracks = playlist.tracks.filter((tid: number) => tid !== trackIdToRemove);
            
            await api.patch(`playlists/${id}/`, { tracks: newTracks }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state
            setPlaylist({ ...playlist, tracks: newTracks });
        } catch (error) {
            console.error("Error quitando canción", error);
            alert("No se pudo quitar la canción. Verifica que tienes permisos.");
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col pb-24">
            
            {/* --- CABECERA DE LA PLAYLIST --- */}
            <div className="flex items-end gap-8 mb-12 mt-8 px-4">
                {/* Cuadrado grande de portada (Wireframe) */}
                <div className="w-56 h-56 bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100/50">
                    <span className="text-7xl opacity-50 drop-shadow-sm">💿</span>
                </div>
                
                <div className="flex flex-col gap-4 flex-1">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Playlist</p>
                    <h1 className="text-6xl font-extrabold text-gray-800 tracking-tight">{playlist.title}</h1>
                    <p className="text-sm font-bold text-gray-500">
                        {playlistTracks.length} tracks • {playlist.is_public ? 'Public' : 'Private'}
                    </p>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center gap-4 mt-2">
                        <button 
                            onClick={() => { if (playlistTracks.length > 0) handlePlayTrack(playlistTracks[0]); }}
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full px-8 py-3 font-bold flex items-center gap-2 hover:scale-105 hover:shadow-lg transition-all shadow-md">
                            ▶ Play All
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TABLA DE CANCIONES --- */}
            <div className="flex flex-col w-full">
                {/* Cabecera de la tabla */}
                <div className="flex items-center text-xs font-bold text-gray-500 border-y border-gray-300 py-2 px-4 uppercase tracking-wider mb-2">
                    <div className="w-8">#</div>
                    <div className="flex-1">Title</div>
                    <div className="w-1/3">Artist</div>
                    <div className="w-24 text-right">⏱ Duration</div>
                </div>

                {/* Filas de canciones */}
                {playlistTracks.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 italic">
                        Esta playlist está vacía.
                    </div>
                ) : (
                    playlistTracks.map((track: any, index: number) => (
                        <div 
                            key={`pt-${track.id}`} 
                            onClick={() => handlePlayTrack(track)}
                            className="flex items-center text-sm py-3 px-4 border-b border-gray-100 hover:bg-orange-50/50 transition-all cursor-pointer group"
                        >
                            {/* Número o botón de Play al pasar el ratón */}
                            <div className="w-8 text-gray-500 font-medium group-hover:text-orange-500 transition-colors">
                                <span className="group-hover:hidden">{index + 1}</span>
                                <span className="hidden group-hover:inline text-orange-500 font-bold">
                                    {(currentTrack?.id === track.id && isPlaying) ? '⏸' : '▶'}
                                </span>
                            </div>
                            
                            {/* Título con foto miniatura */}
                            <div className="flex-1 flex items-center gap-3 pr-4">
                                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-md flex-shrink-0 overflow-hidden shadow-sm">
                                    {track.cover_image ? (
                                        <img src={track.cover_image} alt="cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="flex items-center justify-center w-full h-full text-xs opacity-50">🎵</span>
                                    )}
                                </div>
                                <span className="font-bold truncate group-hover:text-orange-600 transition-colors">{track.title}</span>
                            </div>
                            
                            {/* Artista */}
                            <div className="w-1/3 text-gray-600 truncate pr-4">{track.artist}</div>
                            
                            {/* Duración */}
                            <div className="w-24 text-right text-gray-500 font-medium">
                                <TrackDuration audioUrl={track.audio_file} />
                            </div>

                            {/* Botón Borrar */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.id); }}
                                className="w-8 h-8 ml-4 flex items-center justify-center rounded-full hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlaylistPage;