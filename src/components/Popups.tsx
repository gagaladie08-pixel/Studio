import React from 'react';
import {
  X,
  Play,
  Award,
  BarChart3,
  Clock,
  Calendar,
  Disc3,
  User,
  Music,
  ExternalLink
} from 'lucide-react';
import { Track, Certification } from '../types/novastat';

interface PopupsProps {
  selectedTrack: Track | null;
  selectedArtist: string | null;
  selectedAlbum: { title: string; artist: string } | null;
  allTracks: Track[];
  certifications: Certification[];
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
}

export const Popups: React.FC<PopupsProps> = ({
  selectedTrack,
  selectedArtist,
  selectedAlbum,
  allTracks,
  certifications,
  onClose,
  onPlayTrack
}) => {
  if (!selectedTrack && !selectedArtist && !selectedAlbum) return null;

  // Track Popup Modal
  if (selectedTrack) {
    const trackCerts = certifications.filter((c) => c.trackId === selectedTrack.id);
    const durationMin = Math.floor(selectedTrack.durationMs / 60000);
    const durationSec = Math.floor((selectedTrack.durationMs % 60000) / 1000);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Track Header */}
          <div className="flex items-center space-x-4">
            <img
              src={selectedTrack.coverUrl}
              alt={selectedTrack.title}
              className="w-20 h-20 rounded-xl object-cover shadow-lg border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block">
                Fiche Morceau • TrackPopup
              </span>
              <h2 className="text-xl font-black text-white truncate">{selectedTrack.title}</h2>
              <p className="text-sm text-slate-300 truncate">{selectedTrack.artist}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{selectedTrack.album}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Volume Total d\'Écoutes</span>
              <span className="font-mono font-bold text-lg text-amber-400">
                {selectedTrack.scrobblesCount} streams
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Durée de la Piste</span>
              <span className="font-mono font-bold text-lg text-slate-200">
                {durationMin}:{durationSec < 10 ? '0' : ''}{durationSec}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Premier Scrobble</span>
              <span className="font-mono text-xs text-slate-300">
                {selectedTrack.firstScrobbleDate}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Dernière Écoute</span>
              <span className="font-mono text-xs text-slate-300">
                {selectedTrack.lastScrobbleDate}
              </span>
            </div>
          </div>

          {/* Certifications Attribuées */}
          {trackCerts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Certifications Homologuées</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {trackCerts.map((cert) => (
                  <span
                    key={cert.id}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono"
                  >
                    🏆 {cert.level} ({cert.certificateNumber})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                onPlayTrack(selectedTrack);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Écouter dans le lecteur</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Artist Popup Modal
  if (selectedArtist) {
    const artistTracks = allTracks
      .filter((t) => t.artist.toLowerCase().includes(selectedArtist.toLowerCase()))
      .sort((a, b) => b.scrobblesCount - a.scrobblesCount);
    const totalArtistScrobbles = artistTracks.reduce((acc, curr) => acc + curr.scrobblesCount, 0);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Artist Header */}
          <div className="flex items-center space-x-4">
            <img
              src={artistTracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
              alt={selectedArtist}
              className="w-18 h-18 rounded-full object-cover shadow-lg border-2 border-amber-400"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                Fiche Artiste • ArtistPopup
              </span>
              <h2 className="text-xl font-black text-white truncate">{selectedArtist}</h2>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                <span className="font-bold text-amber-400 font-mono">{totalArtistScrobbles} scrobbles</span>
                <span>•</span>
                <span>{artistTracks.length} titres au catalogue</span>
              </div>
            </div>
          </div>

          {/* Tracks List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
              Top Morceaux
            </h4>
            {artistTracks.map((t, idx) => (
              <div
                key={t.id}
                className="pt-2 flex items-center justify-between hover:bg-slate-800/40 p-2 rounded-lg transition-colors group cursor-pointer"
                onClick={() => onPlayTrack(t)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="font-mono text-xs text-slate-500 w-5">#{idx + 1}</span>
                  <img src={t.coverUrl} alt={t.title} className="w-9 h-9 rounded object-cover" />
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-white group-hover:text-indigo-400 truncate block">
                      {t.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">{t.album}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {t.scrobblesCount}
                  </span>
                  <button
                    aria-label={`Écouter ${t.title}`}
                    className="p-1.5 rounded-full bg-slate-800 group-hover:bg-indigo-600 text-white"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Album Popup Modal
  if (selectedAlbum) {
    const albumTracks = allTracks.filter(
      (t) => t.album.toLowerCase() === selectedAlbum.title.toLowerCase()
    );
    const totalAlbumScrobbles = albumTracks.reduce((acc, curr) => acc + curr.scrobblesCount, 0);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <img
              src={albumTracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
              alt={selectedAlbum.title}
              className="w-20 h-20 rounded-xl object-cover shadow-lg border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 block">
                Fiche Album • AlbumPopup
              </span>
              <h2 className="text-xl font-black text-white truncate">{selectedAlbum.title}</h2>
              <p className="text-sm text-slate-300 truncate">{selectedAlbum.artist}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {totalAlbumScrobbles} écoutes cumulées • {albumTracks.length} pistes
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
              Pistes Référencées
            </h4>
            {albumTracks.map((t) => (
              <div
                key={t.id}
                onClick={() => onPlayTrack(t)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Disc3 className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white">{t.title}</span>
                </div>
                <span className="text-xs font-mono text-indigo-300">{t.scrobblesCount} streams</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
