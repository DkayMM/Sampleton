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

    // 🚨 1. NUEVOS ESTADOS PARA EL MENÚ DE PERFIL
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const volumeBarRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access');
            
            try {
                // Las canciones las pedimos siempre (para invitados y logueados)
                const tracksResponse = await api.get('tracks/');
                setTracks(tracksResponse.data); 
                
                if (!token) {
                    setIsGuest(true);
                } else {
                    // 👇 MAGIA: Si hay token, pedimos también la foto de perfil 👇
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

    // 🚨 2. EFECTO PARA CERRAR EL MENÚ SI HACES CLIC FUERA
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
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
                let percent = (e.clientX - bounds.left) / bounds.width;
                percent = Math.max(0, Math.min(1, percent));
                setVolume(percent);
                if (audioRef.current) audioRef.current.volume = percent;
            }
            if (isDraggingProgress && progressBarRef.current && duration) {
                const bounds = progressBarRef.current.getBoundingClientRect();
                let percent = (e.clientX - bounds.left) / bounds.width;
                percent = Math.max(0, Math.min(1, percent));
                setCurrentTime(percent * duration);
                if (audioRef.current) audioRef.current.currentTime = percent * duration;
            }
        };
        const handleMouseUp = () => {
            setIsDraggingVolume(false);
            setIsDraggingProgress(false);
        };
        if (isDraggingVolume || isDraggingProgress) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingVolume, isDraggingProgress, duration]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black pb-24 select-none">
            
            <header className="flex items-center justify-between p-4 border-b border-gray-300 sticky top-0 bg-white z-10 shadow-sm">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-black flex items-center justify-center rounded">
                        <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="font-bold text-lg tracking-tight">SAMPLETON</span>
                </div>
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400">🔍</span>
                        <input type="text" placeholder="Search for samples..." className="w-full bg-gray-100 border border-gray-300 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-black"/>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <button onClick={() => navigate('/')} className="border border-black px-4 py-1.5 rounded hover:bg-gray-100 transition-colors">Discover</button>
                    {!isGuest && <button className="border border-black px-4 py-1.5 rounded hover:bg-gray-100 transition-colors">My Library</button>}
                    <button onClick={() => isGuest ? navigate('/login') : navigate('/upload')} className="bg-black text-white border border-black px-4 py-1.5 rounded flex items-center gap-2 hover:bg-gray-800 transition-colors">↑ Upload</button>
                    
                    {/* 🚨 3. EL MENÚ DESPLEGABLE CON FOTO DE PERFIL */}
                    {isGuest ? (
                        <button onClick={() => navigate('/login')} className="w-8 h-8 rounded-full border border-black flex items-center justify-center hover:bg-gray-100">👤</button>
                    ) : (
                        <div className="relative" ref={menuRef}>
                            {/* Botón que abre/cierra el menú */}
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                                className={`w-8 h-8 rounded-full border border-black flex items-center justify-center transition-colors focus:outline-none overflow-hidden ${isProfileMenuOpen ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>👤</span>
                                )}
                            </button>
                            
                            {/* La caja blanca que se despliega */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50 flex flex-col overflow-hidden">
                                    <button 
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            navigate('/profile');
                                        }} 
                                        className="px-4 py-3 text-left text-sm font-bold hover:bg-gray-100 transition-colors border-b border-gray-200"
                                    >
                                        Edit Profile
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            handleLogout();
                                        }} 
                                        className="px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-6 flex gap-8">
                <Outlet context={{ tracks, handlePlayTrack, currentTrack, isPlaying }} />
            </main>

            <audio 
                ref={audioRef}
                src={currentTrack ? currentTrack.audio_file : ''}
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleNext}
                onTimeUpdate={(e) => { if (!isDraggingProgress) setCurrentTime(e.currentTarget.currentTime); }}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[800px] max-w-full bg-white border border-black rounded-full px-6 py-3 flex items-center justify-between shadow-lg z-50">
                <div className="flex items-center gap-3 w-1/4">
                    {currentTrack ? (
                        <>
                            <div className="w-10 h-10 bg-gray-200 rounded border border-gray-400 overflow-hidden flex-shrink-0">
                                {currentTrack.cover_image ? <img src={currentTrack.cover_image} alt="cover" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-xs">🎵</span>}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-bold text-sm truncate">{currentTrack.title}</div>
                                <div className="text-xs text-gray-600 truncate">{currentTrack.artist}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 bg-gray-300 rounded border border-gray-400"></div>
                            <div className="flex-1"><div className="h-2 bg-gray-200 rounded w-full mb-1"></div><div className="h-1.5 bg-gray-100 rounded w-1/2"></div></div>
                        </>
                    )}
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 text-xl">
                        <button onClick={handlePrev} className={`hover:scale-110 transition-transform ${currentTrack ? 'text-black' : 'text-gray-400 cursor-not-allowed'}`}>⏮</button>
                        <button onClick={togglePlayPause} className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform text-white ${currentTrack ? 'bg-black cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}>
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                        <button onClick={handleNext} className={`hover:scale-110 transition-transform ${currentTrack ? 'text-black' : 'text-gray-400 cursor-not-allowed'}`}>⏭</button>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-[400px] text-xs text-gray-500 font-medium">
                        <span>{formatTime(currentTime)}</span>
                        <div ref={progressBarRef} className="h-1.5 bg-gray-200 rounded-full flex-1 relative cursor-pointer hover:h-2 transition-all py-1 -my-1" onMouseDown={(e) => {
                                setIsDraggingProgress(true);
                                if (progressBarRef.current && duration) {
                                    const bounds = progressBarRef.current.getBoundingClientRect();
                                    let percent = (e.clientX - bounds.left) / bounds.width;
                                    percent = Math.max(0, Math.min(1, percent));
                                    setCurrentTime(percent * duration);
                                    if (audioRef.current) audioRef.current.currentTime = percent * duration;
                                }
                            }}>
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-black rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}></div>
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="w-1/4 flex justify-end items-center gap-2 text-sm">
                    <span>🔊</span>
                    <div ref={volumeBarRef} className="w-20 h-1.5 bg-gray-200 rounded-full relative cursor-pointer hover:h-2 transition-all py-1 -my-1" onMouseDown={(e) => {
                            setIsDraggingVolume(true);
                            if (volumeBarRef.current) {
                                const bounds = volumeBarRef.current.getBoundingClientRect();
                                let percent = (e.clientX - bounds.left) / bounds.width;
                                percent = Math.max(0, Math.min(1, percent));
                                setVolume(percent);
                                if (audioRef.current) audioRef.current.volume = percent;
                            }
                        }}>
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-black rounded-full" style={{ width: `${volume * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;