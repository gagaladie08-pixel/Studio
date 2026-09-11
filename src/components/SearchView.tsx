import React, { useState, useMemo } from 'react';
import {
  Search,
  Music,
  User,
  Disc,
  Play,
  ExternalLink,
  History,
  Calendar,
  X
} from 'lucide-react';
import { Track, Scrobble } from '../types/novastat';

interface SearchViewProps {
  tracks: Track[];
  scrobbles: Scrobble[];
  onPlayTrack: (track: Track) => void;
  onOpenTrackPopup: (track: Track) => void;
  onOpenArtistPopup: (artistName: string) => void;
  onOpenAlbumPopup: (albumName: string, artistName: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  tracks,
  scrobbles,
  onPlayTrack,
  onOpenTrackPopup,
  onOpenArtistPopup,
  onOpenAlbumPopup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TRACKS' | 'ARTISTS' | 'ALBUMS' | 'HISTORY'>('ALL');

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    if (!searchTerm.trim()) return tracks;
    const q = searchTerm.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        (t.genre && t.genre.toLowerCase().includes(q))
    );
  }, [tracks, searchTerm]);

  // Unique artists
  const artistsList = useMemo(() => {
    const map = new Map<string, { name: string; scrobbles: number; sampleCover: string; tracksCount: number }>();
    tracks.forEach((t) => {
      const existing = map.get(t.artist);
      if (existing) {
        existing.scrobbles += t.scrobblesCount;
        existing.tracksCount += 1;
      } else {
        map.set(t.artist, {
          name: t.artist,
          scrobbles: t.scrobblesCount,
          sampleCover: t.coverUrl,
          tracksCount: 1
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => b.scrobbles - a.scrobbles);
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((a) => a.name.toLowerCase().includes(q));
  }, [tracks, searchTerm]);

  // Unique albums
  const albumsList = useMemo(() => {
    const map = new Map<string, { title: string; artist: string; scrobbles: number; coverUrl: string; year?: number }>();
    tracks.forEach((t) => {
      const key = `${t.album}___${t.artist}`;
      const existing = map.get(key);
      if (existing) {
        existing.scrobbles += t.scrobblesCount;
      } else {
        map.set(key, {
          title: t.album,
          artist: t.artist,
          scrobbles: t.scrobblesCount,
          coverUrl: t.coverUrl,
          year: t.releaseYear
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => b.scrobbles - a.scrobbles);
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((al) => al.title.toLowerCase().includes(q) || al.artist.toLowerCase().includes(q));
  }, [tracks, searchTerm]);

  // History / Scrobbles list
  const filteredScrobbles = useMemo(() => {
    if (!searchTerm.trim()) return scrobbles;
    const q = searchTerm.toLowerCase();
    return scrobbles.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }, [scrobbles, searchTerm]);

  return (
    <div id="search-view" className="space-y-6 pb-28">
      {/* Search Header Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="input-global-search"
            type="text"
            placeholder="Rechercher un morceau, un artiste, un album ou un genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          {[
            { id: 'ALL', label: `Tout explorer (${filteredTracks.length})`, icon: Music },
            { id: 'TRACKS', label: `Titres (${filteredTracks.length})`, icon: Music },
            { id: 'ARTISTS', label: `Artistes (${artistsList.length})`, icon: User },
            { id: 'ALBUMS', label: `Albums (${albumsList.length})`, icon: Disc },
            { id: 'HISTORY', label: `Historique des scrobbles (${filteredScrobbles.length})`, icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Content */}
      {(activeFilter === 'ALL' || activeFilter === 'TRACKS') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Music className="w-4 h-4 text-indigo-400" />
              <span>Titres ({filteredTracks.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => onOpenTrackPopup(track)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between space-x-3 transition-colors group"
              >
                <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover shadow" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-white group-hover:text-indigo-400 truncate transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                  <span className="text-[11px] font-mono text-indigo-300">
                    {track.scrobblesCount} scrobbles
                  </span>
                </div>
                <button
                  aria-label={`Écouter ${track.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(track);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                  title="Écouter"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artists Section */}
      {(activeFilter === 'ALL' || activeFilter === 'ARTISTS') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Artistes ({artistsList.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {artistsList.map((artist) => (
              <div
                key={artist.name}
                onClick={() => onOpenArtistPopup(artist.name)}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer text-center flex flex-col items-center group transition-colors"
              >
                <img
                  src={artist.sampleCover}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full object-cover shadow-lg mb-2 group-hover:scale-105 transition-transform"
                />
                <h4 className="font-bold text-xs text-white group-hover:text-amber-300 truncate w-full">
                  {artist.name}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {artist.scrobbles} streams
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Albums Section */}
      {(activeFilter === 'ALL' || activeFilter === 'ALBUMS') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Disc className="w-4 h-4 text-pink-400" />
              <span>Albums ({albumsList.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albumsList.map((album) => (
              <div
                key={`${album.title}-${album.artist}`}
                onClick={() => onOpenAlbumPopup(album.title, album.artist)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 cursor-pointer group transition-colors flex flex-col justify-between"
              >
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full aspect-square rounded-lg object-cover shadow-md mb-2 group-hover:opacity-90"
                />
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-pink-300 truncate">
                    {album.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{album.artist}</p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  {album.scrobbles} scrobbles
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Log Section */}
      {activeFilter === 'HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white">Journal Chronologique des Scrobbles</span>
            <span className="text-slate-400">{filteredScrobbles.length} sessions validées</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filteredScrobbles.slice(0, 25).map((scrobble) => (
              <div
                key={scrobble.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={scrobble.coverUrl} alt={scrobble.title} className="w-10 h-10 rounded object-cover" />
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-white truncate block">
                      {scrobble.title}
                    </span>
                    <span className="text-xs text-slate-400 truncate block">
                      {scrobble.artist} • <span className="italic">{scrobble.album}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400 flex-shrink-0">
                  <span className="block text-slate-300">
                    {new Date(scrobble.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(scrobble.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
