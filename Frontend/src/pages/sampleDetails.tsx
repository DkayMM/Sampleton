import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/axios';

type ContextType = {
    tracks: any[];
    handlePlayTrack: (track: any) => void;
    currentTrack: any;
    isPlaying: boolean;
    openPlaylistModal: (track: any) => void;
};

const SampleDetails = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { handlePlayTrack, currentTrack, isPlaying, openPlaylistModal } = useOutletContext<ContextType>();

    const [track, setTrack] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Nuevos estados para Likes y Share
    const [likes, setLikes] = useState<any[]>([]);
    const [myUserId, setMyUserId] = useState<number | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const trackRes = await api.get(`tracks/${id}/`);
                setTrack(trackRes.data);

                // Pedimos los comentarios filtrados por esta canción
                const commentsRes = await api.get(`comments/?track=${id}`);
                setComments(commentsRes.data);

                const likesRes = await api.get(`likes/?track=${id}`);
                setLikes(likesRes.data);

                const token = localStorage.getItem('access');
                if (token) {
                    try {
                        const profileResponse = await api.get('profile/me/', { headers: { 'Authorization': `Bearer ${token}` } });
                        setMyUserId(profileResponse.data.user);
                    } catch (e) {
                        // ignore fetch profile errors
                    }
                }
            } catch (error) {
                console.error("Error cargando el sample", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem('access');
        if (!token) {
            alert("Debes iniciar sesión para comentar.");
            navigate('/login');
            return;
        }

        try {
            const res = await api.post(`comments/`, 
                { 
                    content: newComment,
                    track: id 
                }, 
                { headers: { 'Authorization': `Bearer ${token}` }}
            );
            
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (error) {
            alert("Error al publicar el comentario.");
            console.error(error);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Debes iniciar sesión para dar like.');
            navigate('/login');
            return;
        }
        const myLike = likes.find(l => l.user === myUserId);
        try {
            if (myLike) {
                // Remove like
                await api.delete(`likes/${myLike.id}/`, { headers: { 'Authorization': `Bearer ${token}` } });
                setLikes(likes.filter(l => l.id !== myLike.id));
            } else {
                // Add like
                if (track) {
                    const res = await api.post('likes/', { track: track.id }, { headers: { 'Authorization': `Bearer ${token}` } });
                    setLikes([...likes, res.data]);
                }
            }
        } catch (error) {
            console.error('Error toggling like', error);
        }
    };

    if (isLoading) return <div className="p-8 font-bold text-center">Cargando sample...</div>;
    if (!track) return <div className="p-8 font-bold text-red-500 text-center">Sample no encontrado.</div>;

    // Generamos barras aleatorias para simular la onda de sonido visualmente
    const waveformBars = Array.from({ length: 60 }).map(() => Math.floor(Math.random() * 80) + 20);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col pb-32 pt-8">
            
            {/* --- SECCIÓN SUPERIOR: PORTADA, ONDA Y BOTONES --- */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                
                {/* Portada (Izquierda) */}
                <div 
                    onClick={() => handlePlayTrack(track)}
                    className="w-64 h-64 bg-gray-200 border border-gray-400 flex-shrink-0 cursor-pointer group relative overflow-hidden shadow-sm"
                >
                    {track.cover_image ? (
                        <img src={track.cover_image} alt={track.title} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                    ) : (
                        <span className="w-full h-full flex items-center justify-center text-6xl opacity-30">🎵</span>
                    )}
                    
                    {/* Botón Play Superpuesto */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-orange-900/30 to-transparent">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-3xl border-2 border-white drop-shadow-lg shadow-xl hover:scale-110 transition-transform">
                            {(currentTrack?.id === track.id && isPlaying) ? '⏸' : '▶'}
                        </div>
                    </div>
                </div>

                {/* Detalles (Derecha) */}
                <div className="flex-1 flex flex-col w-full">
                    <div className="mb-4">
                        <h1 className="text-4xl font-extrabold mb-1 text-gray-800">{track.title}</h1>
                        <p className="text-lg text-orange-500 font-bold">{track.artist}</p>
                    </div>

                    {/* Waveform Visualizer */}
                    <div className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between px-2 mb-6 cursor-pointer hover:bg-orange-50/50 hover:border-orange-300 transition-all shadow-inner" onClick={() => handlePlayTrack(track)}>
                        {waveformBars.map((height, i) => (
                            <div 
                                key={i} 
                                className={`w-1.5 rounded-full transition-all ${
                                    (currentTrack?.id === track.id && isPlaying) ? 'bg-gradient-to-t from-orange-500 to-yellow-500 animate-pulse' : 'bg-gray-300'
                                }`}
                                style={{ height: `${height}%` }}
                            ></div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleLike}
                                className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl transition-all shadow-sm ${
                                    likes.find(l => l.user === myUserId) 
                                    ? 'bg-orange-50 text-orange-500 border-2 border-orange-300 hover:bg-orange-100 hover:scale-110' 
                                    : 'bg-white border-2 border-gray-200 text-gray-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300 hover:scale-110'
                                }`}
                                title={likes.find(l => l.user === myUserId) ? 'Unlike' : 'Like'}
                            >
                                {likes.find(l => l.user === myUserId) ? '♥' : '♡'}
                            </button>
                            <span className="font-bold text-gray-700 mr-2">{likes.length} likes</span>
                            <button 
                                onClick={() => openPlaylistModal(track)}
                                className="border-2 border-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm"
                            >
                                + Add to Playlist
                            </button>
                            
                            <div className="relative">
                                <button onClick={() => setIsShareOpen(!isShareOpen)} className="border-2 border-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm">
                                    ➦ Share
                                </button>
                                {isShareOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Enlace copiado al portapapeles!');
                                            setIsShareOpen(false);
                                        }} className="px-4 py-3 text-left text-sm font-bold text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                                            Copiar Enlace
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                            <span>▶ {track.play_count || 0} plays</span>
                            <span>♡ 0 likes</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-t border-black mb-10 opacity-20" />

            {/* --- SECCIÓN INFERIOR: COMENTARIOS --- */}
            <div className="flex flex-col gap-8">
                <h2 className="text-2xl font-bold">Comments</h2>

                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-gray-200 rounded-full border border-gray-400 flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-500">
                        {localStorage.getItem('username')?.charAt(0).toUpperCase() || '👤'}
                    </div>
                    <form onSubmit={handlePostComment} className="flex-1 flex gap-2">
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..." 
                            className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                        <button type="submit" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 rounded-xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all">
                            Post
                        </button>
                    </form>
                </div>

                <div className="flex flex-col gap-6 mt-4">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 italic">Be the first to comment!</p>
                    ) : (
                        comments.map((comment, index) => (
                            <div key={`comment-${comment.id || index}`} className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full border border-gray-400 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold">
                                    {comment.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex flex-col flex-1 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">{comment.username || 'User'}</span>
                                        <span className="text-xs text-gray-400">🕒 at {comment.posted_at ? new Date(comment.posted_at).toLocaleTimeString() : 'now'}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default SampleDetails;