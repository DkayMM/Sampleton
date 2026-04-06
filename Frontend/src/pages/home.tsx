import React from 'react';
import { useOutletContext } from 'react-router-dom';

// Le decimos a TypeScript qué datos nos manda el Layout
type ContextType = {
    tracks: any[];
    handlePlayTrack: (track: any) => void;
    currentTrack: any;
    isPlaying: boolean;
};

const Home = () => {
    // Enganchamos el "cable" para recibir los datos del Layout maestro
    const { tracks, handlePlayTrack, currentTrack, isPlaying } = useOutletContext<ContextType>();
    const mockHistory = [1, 2, 3, 4, 5];

    return (
        <>
            <div className="flex-1 flex flex-col gap-10 overflow-hidden">
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-xl font-bold">Most Liked</h2>
                        <button className="text-xs font-bold hover:underline">See all &gt;</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {tracks.length === 0 ? <p className="text-gray-500 italic">No hay canciones todavía...</p> : (
                            tracks.map((track) => (
                                <div key={`liked-${track.id}`} onClick={() => handlePlayTrack(track)} className="min-w-[180px] w-[180px] group cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                    <div className="relative w-full h-[180px] bg-gray-200 rounded border border-gray-400 mb-2 flex items-center justify-center overflow-hidden">
                                        {track.cover_image ? (
                                            <img src={track.cover_image} alt={track.title} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70" />
                                        ) : (
                                            <span className="text-4xl opacity-50 transition-opacity group-hover:opacity-30">🎵</span>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-4xl drop-shadow-md text-white border-2 border-white rounded-full bg-black bg-opacity-30 w-12 h-12 flex items-center justify-center">
                                                {(currentTrack?.id === track.id && isPlaying) ? '⏸' : '▶'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm truncate" title={track.title}>{track.title}</div>
                                    <div className="text-xs text-gray-600 truncate">{track.artist} • <span className="uppercase">{track.genre}</span></div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Most Commented es idéntico visualmente por ahora */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-xl font-bold">Most Commented</h2>
                        <button className="text-xs font-bold hover:underline">See all &gt;</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {tracks.length === 0 ? <p className="text-gray-500 italic">No hay canciones todavía...</p> : (
                            tracks.map((track) => (
                                <div key={`commented-${track.id}`} onClick={() => handlePlayTrack(track)} className="min-w-[180px] w-[180px] group cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                    <div className="relative w-full h-[180px] bg-gray-200 rounded border border-gray-400 mb-2 flex items-center justify-center overflow-hidden">
                                        {track.cover_image ? (
                                            <img src={track.cover_image} alt={track.title} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70" />
                                        ) : (
                                            <span className="text-4xl opacity-50 transition-opacity group-hover:opacity-30">🎵</span>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-4xl drop-shadow-md text-white border-2 border-white rounded-full bg-black bg-opacity-30 w-12 h-12 flex items-center justify-center">
                                                {(currentTrack?.id === track.id && isPlaying) ? '⏸' : '▶'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm truncate" title={track.title}>{track.title}</div>
                                    <div className="text-xs text-gray-600 truncate">{track.artist} • <span className="uppercase">{track.genre}</span></div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <aside className="w-[300px] flex flex-col gap-6 shrink-0">
                <div className="border border-gray-400 rounded p-4 bg-white shadow-sm">
                    <h3 className="font-bold mb-4">Listening History</h3>
                    <div className="flex flex-col gap-3">
                        {mockHistory.map((item) => (
                            <div key={`history-${item}`} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded border border-gray-400 shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-2.5 bg-gray-200 rounded w-full mb-1.5"></div>
                                    <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Home;