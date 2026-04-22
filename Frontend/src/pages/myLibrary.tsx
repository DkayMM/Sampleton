import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/axios';

type ContextType = {
    tracks?: any[];
    handlePlayTrack?: (track: any) => void;
    currentTrack?: any;
    isPlaying?: boolean;
    openPlaylistModal?: (track: any) => void;
};

const MyLibrary = () => {
    const navigate = useNavigate();
    const context = useOutletContext<ContextType>();
    
    const [profile, setProfile] = useState<any>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [myTracks, setMyTracks] = useState<any[]>([]); 
    const [likedTracks, setLikedTracks] = useState<any[]>([]); 
    const [activeTab, setActiveTab] = useState('Samples'); 
    const [isLoading, setIsLoading] = useState(true);

    // 🚨 ESTADO PARA EL MENÚ DE 3 PUNTITOS
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const getPlaylistTrackCount = (pl: any) => {
        if (!context?.tracks || !pl.tracks) return 0;
        return Array.from(new Set(pl.tracks)).filter((tid: any) => context.tracks!.some(t => t.id === tid)).length;
    };

    const fetchData = async () => {
        const token = localStorage.getItem('access');
        const username = localStorage.getItem('username');
        if (!token) return navigate('/login');
        
        try {
            const [profileRes, playlistsRes, tracksRes, likesRes] = await Promise.all([
                api.get('profile/me/', { headers: { 'Authorization': `Bearer ${token}` } }),
                api.get('playlists/', { headers: { 'Authorization': `Bearer ${token}` } }),
                api.get('tracks/'),
                api.get('likes/', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setProfile(profileRes.data);
            setPlaylists(playlistsRes.data);
            // 🚨 Filtramos para que solo salgan las canciones subidas por TI
            setMyTracks(tracksRes.data.filter((t: any) => t.user === profileRes.data.user || t.artist === username));
            
            // 🚨 Filtramos canciones a las que les diste like
            setLikedTracks(tracksRes.data.filter((t: any) => likesRes.data.some((l: any) => l.track === t.id)));
            
        } catch (error) {  
            console.error("Error al cargar la biblioteca:", error); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, [navigate]);

    // 🚨 FUNCIONALIDAD DE BORRADO SEGURO
    const handleDelete = async (id: number, type: 'track' | 'playlist') => {
        if (!window.confirm(`¿Estás seguro de que quieres borrar este ${type}? Esta acción no se puede deshacer.`)) return;
        
        const token = localStorage.getItem('access');
        try {
            const endpoint = type === 'track' ? `tracks/${id}/` : `playlists/${id}/`;
            await api.delete(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOpenMenuId(null);
            fetchData(); // Recargamos la lista automáticamente tras borrar
        } catch (error) { 
            alert("Error al borrar. Asegúrate de que tienes permisos."); 
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8 font-bold text-center">Cargando tu biblioteca...</div>;

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col animate-fadeIn">
            
            <div className="flex items-center gap-8 mb-10 mt-4">
                <div className="w-40 h-40 bg-gray-200 rounded-full border border-gray-400 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {profile?.avatar_file ? <img src={profile.avatar_file} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-6xl text-gray-400">👤</span>}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <h1 className="text-4xl font-bold">{profile?.display_name || profile?.username || 'User'}</h1>
                    <p className="text-gray-500 font-medium">@{profile?.username}</p>
                    {profile?.bio && <p className="text-sm mt-2 max-w-2xl text-gray-700">{profile.bio}</p>}
                </div>
            </div>

            <div className="flex gap-8 border-b border-gray-200 mb-6">
                {['Samples', 'Playlists', 'Likes'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 font-bold text-sm transition-all ${activeTab === tab ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>{tab}</button>
                ))}
            </div>

            <div className="pb-24">
                
                {/* --- PESTAÑA SAMPLES --- */}
                {activeTab === 'Samples' && (
                    <div className="flex flex-col gap-3">
                        {myTracks.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 italic border-2 border-dashed border-gray-200">No has subido ningún sample todavía.</div>
                        ) : (
                            myTracks.map((track: any) => (
                                <div key={`lib-track-${track.id}`} onClick={() => navigate(`/track/${track.id}`)} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg transition-all group relative cursor-pointer hover:bg-orange-50/50 hover:border-orange-300 hover:shadow-md">
                                    <button onClick={(e) => { e.stopPropagation(); context?.handlePlayTrack?.(track); }} className="w-10 h-10 border-2 border-orange-500 text-orange-500 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:border-transparent hover:text-white hover:scale-105 transition-all shadow-sm">
                                        {(context?.currentTrack?.id === track.id && context?.isPlaying) ? '⏸' : '▶'}
                                    </button>
                                    
                                    <div className="w-12 h-12 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 rounded-md">
                                        {track.cover_image ? <img src={track.cover_image} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full opacity-50">🎵</span>}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="font-bold text-sm group-hover:text-orange-600 transition-colors">{track.title}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{track.artist}</div>
                                    </div>
                                    
                                    <div className="relative flex items-center">
                                        <button onClick={(e) => { e.stopPropagation(); context?.openPlaylistModal?.(track); }} className="mr-2 w-8 h-8 border-2 border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors bg-white shadow-sm" title="Add to Playlist">+</button>
                                        
                                        {/* 🚨 BOTÓN DE 3 PUNTOS Y MENÚ DESPLEGABLE (SAMPLES) */}
                                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `t-${track.id}` ? null : `t-${track.id}`); }} className="p-2 w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full font-bold text-xl transition-colors">⋮</button>
                                        
                                        {openMenuId === `t-${track.id}` && (
                                            <div className="absolute right-0 top-10 w-36 bg-white border border-black shadow-lg z-50 overflow-hidden">
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(track.id, 'track'); }} className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors">Borrar Sample</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* --- PESTAÑA PLAYLISTS --- */}
                {activeTab === 'Playlists' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div onClick={() => context?.openPlaylistModal?.(null)} className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-all group bg-gray-50 hover:bg-orange-50/30 text-gray-500 hover:text-orange-500">
                            <div className="w-16 h-16 flex items-center justify-center text-4xl mb-1 transition-transform group-hover:scale-110">+</div>
                            <div className="font-bold text-lg">Create New Playlist</div>
                        </div>

                        {playlists.map((pl: any) => (
                            <div key={`lib-pl-${pl.id}`} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition-all group shadow-sm bg-white hover:shadow-md hover:bg-orange-50/20" onClick={() => navigate(`/playlist/${pl.id}`)}>
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 rounded-lg flex items-center justify-center group-hover:from-orange-500 group-hover:to-yellow-500 group-hover:border-transparent group-hover:text-white transition-all text-2xl shadow-sm group-hover:shadow-orange-200">💿</div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg group-hover:text-orange-600 transition-colors">{pl.title}</div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest group-hover:text-gray-500 transition-colors">{getPlaylistTrackCount(pl)} Tracks</div>
                                </div>
                                
                                <div className="relative">
                                    {/* 🚨 BOTÓN DE 3 PUNTOS Y MENÚ DESPLEGABLE (PLAYLISTS) */}
                                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `p-${pl.id}` ? null : `p-${pl.id}`); }} className="p-2 w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full font-bold text-xl transition-colors">⋮</button>
                                    
                                    {openMenuId === `p-${pl.id}` && (
                                        <div className="absolute right-0 top-10 w-40 bg-white border border-black shadow-lg z-50 overflow-hidden">
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(pl.id, 'playlist'); }} className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors">Borrar Playlist</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- PESTAÑA LIKES --- */}
                {activeTab === 'Likes' && (
                    <div className="flex flex-col gap-3">
                        {likedTracks.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 italic border-2 border-dashed border-gray-200">Pronto podrás ver aquí tus canciones favoritas.</div>
                        ) : (
                            likedTracks.map((track: any) => (
                                <div key={`lib-like-${track.id}`} onClick={() => navigate(`/track/${track.id}`)} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg transition-all group relative cursor-pointer hover:bg-orange-50/50 hover:border-orange-300 hover:shadow-md">
                                    <button onClick={(e) => { e.stopPropagation(); context?.handlePlayTrack?.(track); }} className="w-10 h-10 border-2 border-orange-500 text-orange-500 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-500 hover:border-transparent hover:text-white hover:scale-105 transition-all shadow-sm">
                                        {(context?.currentTrack?.id === track.id && context?.isPlaying) ? '⏸' : '▶'}
                                    </button>
                                    
                                    <div className="w-12 h-12 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 rounded-md">
                                        {track.cover_image ? <img src={track.cover_image} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full opacity-50">🎵</span>}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="font-bold text-sm group-hover:text-orange-600 transition-colors">{track.title}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{track.artist}</div>
                                    </div>
                                    
                                    <div className="relative flex items-center">
                                        <button onClick={(e) => { e.stopPropagation(); context?.openPlaylistModal?.(track); }} className="mr-4 w-8 h-8 border-2 border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors bg-white shadow-sm" title="Add to Playlist">+</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLibrary;