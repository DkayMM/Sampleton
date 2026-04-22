import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

const Layout = () => {
    const navigate = useNavigate();
    const [isGuest, setIsGuest] = useState(false);
    const [tracks, setTracks] = useState<any[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [currentTrack, setCurrentTrack] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [isDraggingProgress, setIsDraggingProgress] = useState(false);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const volumeBarRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // 🚨 ESTADO DEL MODO OSCURO
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);
    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    // 🚨 NUEVOS ESTADOS PARA EL MODAL DE PLAYLISTS
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [trackToAdd, setTrackToAdd] = useState<any>(null);
    const [myPlaylists, setMyPlaylists] = useState<any[]>([]);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access');
            try {
                const tracksResponse = await api.get('tracks/');
                setTracks(tracksResponse.data); 
                if (!token) {
                    setIsGuest(true);
                } else {
                    const profileResponse = await api.get('profile/me/', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setAvatarUrl(profileResponse.data.avatar_file);
                }
            } catch (error) {
                console.error("Error al cargar datos", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsProfileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    const handlePlayTrack = (track: any) => {
        if (currentTrack && currentTrack.id === track.id) {
            togglePlayPause();
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    };

    const togglePlayPause = () => {
        if (!currentTrack || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        if (!currentTrack || tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        handlePlayTrack(tracks[nextIndex]);
    };

    const handlePrev = () => {
        if (!currentTrack || tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        handlePlayTrack(tracks[prevIndex]);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingVolume && volumeBarRef.current) {
                const bounds = volumeBarRef.current.getBoundingClientRect();
                let percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
                setVolume(percent);
                if (audioRef.current) audioRef.current.volume = percent;
            }
            if (isDraggingProgress && progressBarRef.current && duration) {
                const bounds = progressBarRef.current.getBoundingClientRect();
                let percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
                setCurrentTime(percent * duration);
                if (audioRef.current) audioRef.current.currentTime = percent * duration;
            }
        };
        const handleMouseUp = () => { setIsDraggingVolume(false); setIsDraggingProgress(false); };
        if (isDraggingVolume || isDraggingProgress) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isDraggingVolume, isDraggingProgress, duration]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        return `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
    };

    // 🚨 FUNCIONES DEL MODAL DE PLAYLISTS
    const openPlaylistModal = async (track: any = null) => {
        if (isGuest) {
            alert("Debes iniciar sesión para usar las playlists.");
            navigate('/login');
            return;
        }
        setTrackToAdd(track);
        setIsPlaylistModalOpen(true);
        try {
            const token = localStorage.getItem('access');
            const res = await api.get('playlists/', { headers: { Authorization: `Bearer ${token}` } });
            setMyPlaylists(res.data);
        } catch (error) { console.error(error); }
    };

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistTitle.trim()) return;
        try {
            const token = localStorage.getItem('access');
            const res = await api.post('playlists/', { title: newPlaylistTitle, is_public: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyPlaylists([...myPlaylists, res.data]);
            setNewPlaylistTitle('');
            if (!trackToAdd) {
                alert('¡Playlist creada con éxito!');
                setIsPlaylistModalOpen(false);
            }
        } catch (error) { alert("Error al crear la playlist"); }
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        try {
            const token = localStorage.getItem('access');
            await api.post('playlists-tracks/', {
                playlist: playlistId,
                track: trackToAdd.id,
                order: 1
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert('¡Canción añadida a la playlist!');
            setIsPlaylistModalOpen(false);
        } catch (error) {
            alert("Error al añadir (Quizás ya está en la lista)");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#111] font-sans text-black dark:text-gray-100 pb-24 select-none transition-colors duration-300">
            
            <header className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#111] z-10 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                    <img src="/logo_icon.png" alt="Sampleton" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span className="font-semibold text-2xl tracking-tighter">
                        <span className="text-black dark:text-white">Sample</span><span className="text-orange-500">ton</span>
                    </span>
                </div>
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative group">
                        <span className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </span>
                        <input type="text" placeholder="Search for samples..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"/>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <button onClick={toggleDarkMode} className="p-2 mr-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button onClick={() => navigate('/')} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors">Discover</button>
                    {!isGuest && <button onClick={() => navigate('/library')} className="text-gray-600 hover:text-orange-500 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors">My Library</button>}
                    <button onClick={() => isGuest ? navigate('/login') : navigate('/upload')} className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-5 py-1.5 rounded-full flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all outline-none border-none">↑ Upload</button>
                    
                    {isGuest ? (
                        <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-full border-2 border-orange-500 text-orange-500 flex items-center justify-center hover:bg-orange-50 transition-colors">👤</button>
                    ) : (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`w-9 h-9 rounded-full border-2 border-transparent hover:border-orange-500 flex items-center justify-center transition-all focus:outline-none overflow-hidden shadow-sm ${isProfileMenuOpen ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
                                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-gray-600">👤</span>}
                            </button>
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }} className="px-4 py-3 text-left text-sm font-bold text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors border-b border-gray-100">Edit Profile</button>
                                    <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} className="px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">Log Out</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* 🚨 AÑADIMOS openPlaylistModal AL OUTLET PARA QUE LAS PÁGINAS PUEDAN USARLO */}
            <main className="max-w-[1600px] mx-auto p-6 flex gap-8">
                <Outlet context={{ tracks, handlePlayTrack, currentTrack, isPlaying, openPlaylistModal }} />
            </main>

            <audio ref={audioRef} src={currentTrack ? currentTrack.audio_file : ''} autoPlay={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={handleNext} onTimeUpdate={(e) => { if (!isDraggingProgress) setCurrentTime(e.currentTarget.currentTime); }} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[800px] max-w-full bg-white/90 dark:bg-[#222]/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-full px-6 py-3 flex items-center justify-between shadow-xl z-[90]">
                <div className="flex items-center gap-3 w-1/4">
                    {currentTrack ? (
                        <>
                            <div className="w-12 h-12 bg-orange-100 rounded-full border-2 border-orange-200 overflow-hidden flex-shrink-0 shadow-sm">
                                {currentTrack.cover_image ? <img src={currentTrack.cover_image} alt="cover" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-lg">🎵</span>}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-bold text-sm truncate text-gray-800 dark:text-gray-100">{currentTrack.title}</div>
                                <div className="text-xs text-orange-500 font-medium truncate">{currentTrack.artist}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"></div>
                            <div className="flex-1"><div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div><div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div></div>
                        </>
                    )}
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-6 text-xl">
                        <button onClick={handlePrev} className={`w-6 h-6 hover:scale-125 transition-transform ${currentTrack ? 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-500' : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M18.945 16.94C20.195 17.653 21.75 16.75 21.75 15.312V8.688c0-1.439-1.555-2.342-2.805-1.628L12 11.129V7.062c0-1.439-1.555-2.342-2.805-1.628L2.087 9.495c-1.26.72-1.26 2.536 0 3.256l7.108 4.061c1.25.714 2.805-.189 2.805-1.628v-4.067l6.945 4.18Z" /></svg>
                        </button>
                        <button onClick={togglePlayPause} className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 shadow-md hover:shadow-lg transition-all text-white ${currentTrack ? 'bg-gradient-to-r from-orange-500 to-yellow-500 cursor-pointer' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                            )}
                        </button>
                        <button onClick={handleNext} className={`w-6 h-6 hover:scale-125 transition-transform ${currentTrack ? 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-500' : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.688v6.624c0 1.439 1.555 2.342 2.805 1.628L12 12.871v4.067c0 1.439 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.474 12 7.377 12 8.816v4.067L5.055 7.06Z" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-[400px] text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span className="w-8 text-right">{formatTime(currentTime)}</span>
                        <div ref={progressBarRef} className="h-2 bg-gray-200 rounded-full flex-1 relative cursor-pointer group py-2 -my-2" onMouseDown={(e) => {
                                setIsDraggingProgress(true);
                                if (progressBarRef.current && duration) {
                                    const bounds = progressBarRef.current.getBoundingClientRect();
                                    let percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
                                    setCurrentTime(percent * duration);
                                    if (audioRef.current) audioRef.current.currentTime = percent * duration;
                                }
                            }}>
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full slider-bar transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}></div>
                            {/* Bolita al pasar el ratón */}
                            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" style={{ left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 8px)` }}></div>
                        </div>
                        <span className="w-8 text-left">{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="w-1/4 flex justify-end items-center gap-2 text-sm text-gray-500">
                    <span>🔊</span>
                    <div ref={volumeBarRef} className="w-24 h-2 bg-gray-200 rounded-full relative cursor-pointer group py-2 -my-2" onMouseDown={(e) => {
                            setIsDraggingVolume(true);
                            if (volumeBarRef.current) {
                                const bounds = volumeBarRef.current.getBoundingClientRect();
                                let percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
                                setVolume(percent);
                                if (audioRef.current) audioRef.current.volume = percent;
                            }
                        }}>
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-orange-400 rounded-full" style={{ width: `${volume * 100}%` }}></div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" style={{ left: `calc(${volume * 100}% - 6px)` }}></div>
                    </div>
                </div>
            </div>

            {/* 🚨 EL MODAL VISUAL DE PLAYLISTS */}
            {isPlaylistModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-6 border border-black shadow-2xl w-full max-w-md relative">
                        <button onClick={() => setIsPlaylistModalOpen(false)} className="absolute top-4 right-4 text-xl font-bold hover:text-gray-500">✕</button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-orange-500">
                            {trackToAdd ? 'Add to Playlist' : 'Create Playlist'}
                        </h2>

                        {/* Formulario Crear Nueva */}
                        <form onSubmit={handleCreatePlaylist} className="flex gap-2 mb-6">
                            <input 
                                type="text" 
                                value={newPlaylistTitle} 
                                onChange={(e) => setNewPlaylistTitle(e.target.value)} 
                                placeholder="New playlist name..." 
                                className="flex-1 border-2 border-gray-200 p-3 rounded-xl text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                            <button type="submit" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 font-bold text-sm rounded-xl py-3 hover:shadow-lg hover:scale-105 transition-all">
                                Create
                            </button>
                        </form>

                        {/* Lista de Playlists Existentes (Solo si vamos a añadir una canción) */}
                        {trackToAdd && (
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border-t border-gray-200 pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Your Playlists</p>
                                {myPlaylists.length === 0 ? (
                                    <p className="text-sm italic text-gray-500">No tienes playlists. Crea una arriba.</p>
                                ) : (
                                    myPlaylists.map(pl => (
                                        <button 
                                            key={pl.id} 
                                            onClick={() => handleAddToPlaylist(pl.id)}
                                            className="flex items-center gap-3 p-3 border border-gray-300 hover:border-black hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <span className="text-2xl">💿</span>
                                            <span className="font-bold text-sm">{pl.title}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default Layout;