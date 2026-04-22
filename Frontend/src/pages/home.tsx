import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

type ContextType = {
    tracks: any[];
    handlePlayTrack: (track: any) => void;
    currentTrack: any;
    isPlaying: boolean;
    openPlaylistModal: (track: any) => void;
};

const Home = () => {
    const navigate = useNavigate();
    const { tracks, handlePlayTrack, currentTrack, isPlaying, openPlaylistModal } = useOutletContext<ContextType>();

    const renderGrid = (title: string) => (
        <section>
            <div className="mb-4">
                <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{title}</h2>
            </div>
            {/* 🚨 Añadido un poco de padding (pt-2 pb-6 px-2 -mx-2) para que la sombra al elevar la tarjeta no se corte */}
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 custom-scrollbar">
                {tracks.length === 0 ? <p className="text-gray-500 italic">No hay canciones todavía...</p> : (
                    tracks.map((track) => (
                        <div 
                            key={`grid-${track.id}`} 
                            onClick={() => navigate(`/sample/${track.id}`)}
                            // 🚨 EFECTOS DE HOVER EN LA TARJETA PRINCIPAL (Sombra, Elevación y Borde naranja)
                            className="min-w-[180px] w-[180px] group cursor-pointer bg-transparent hover:bg-white dark:hover:bg-gray-800 p-2 rounded-lg transition-all duration-300 relative hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-black hover:-translate-y-2 border border-transparent hover:border-orange-200 dark:hover:border-gray-700"
                        >
                            
                            {/* BOTÓN '+' PARA AÑADIR A PLAYLIST */}
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    openPlaylistModal(track); 
                                }}
                                className="absolute top-4 right-4 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-orange-500 text-orange-500 rounded-full flex items-center justify-center font-bold text-lg opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all z-20 shadow-md"
                                title="Add to Playlist"
                            >
                                +
                            </button>

                            <div className="relative w-full h-[180px] bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 mb-3 flex items-center justify-center overflow-hidden shadow-sm">
                                {/* 🚨 EFECTO DE ZOOM EN LA IMAGEN */}
                                {track.cover_image ? (
                                    <img src={track.cover_image} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <span className="text-4xl opacity-50 transition-transform duration-500 group-hover:scale-110">🎵</span>
                                )}
                                
                                {/* Capa de oscurecimiento suave para que destaque el botón de Play */}
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-0"></div>

                                {/* BOTÓN DE PLAY (OVERLAY) */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handlePlayTrack(track);
                                        }}
                                        className="text-white border-2 border-white rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 w-14 h-14 flex items-center justify-center hover:scale-110 shadow-lg transition-all"
                                    >
                                        {(currentTrack?.id === track.id && isPlaying) ? (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* 🚨 TÍTULO NARANJA AL HACER HOVER */}
                            <div className="font-bold text-sm truncate group-hover:text-orange-500 dark:text-gray-200 transition-colors" title={track.title}>{track.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{track.artist} • <span className="uppercase">{track.genre}</span></div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );

    return (
        <div className="w-full flex flex-col gap-10 overflow-hidden">
            {renderGrid("Most Liked")}
            {renderGrid("Most Commented")}
        </div>
    );
};

export default Home;