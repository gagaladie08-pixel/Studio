import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  X,
  ExternalLink,
  Disc3,
  TrendingUp,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Certification, CertificationLevel, Track } from '../types/novastat';
import { CERTIFICATION_THRESHOLDS } from '../services/scrobbleEngine';

interface CertificationsViewProps {
  certifications: Certification[];
  tracks: Track[];
  onOpenTrackPopup: (track: Track) => void;
}

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  certifications,
  tracks,
  onOpenTrackPopup
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [selectedPlaque, setSelectedPlaque] = useState<Certification | null>(null);

  const filteredCerts = certifications.filter((cert) => {
    if (filterLevel === 'ALL') return true;
    return cert.level === filterLevel;
  });

  // Calculate upcoming certifications
  const nextMilestones = tracks
    .map((track) => {
      const current = track.scrobblesCount;
      let nextTier: { level: CertificationLevel; required: number } | null = null;

      if (current < 100) nextTier = { level: 'SILVER', required: 100 };
      else if (current < 250) nextTier = { level: 'GOLD', required: 250 };
      else if (current < 500) nextTier = { level: 'PLATINUM', required: 500 };
      else if (current < 800) nextTier = { level: 'MULTI_PLATINUM', required: 800 };
      else if (current < 1000) nextTier = { level: 'DIAMOND', required: 1000 };

      return {
        track,
        current,
        nextTier,
        progress: nextTier ? Math.min(100, (current / nextTier.required) * 100) : 100
      };
    })
    .filter((item) => item.nextTier !== null)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const triggerCelebration = (cert: Certification) => {
    setSelectedPlaque(cert);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getPlaqueStyle = (level: CertificationLevel) => {
    switch (level) {
      case 'DIAMOND':
        return {
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          gradient: 'from-pink-500/20 via-purple-900/30 to-slate-900',
          border: 'border-pink-500/40 shadow-pink-500/10',
          tag: 'DIAMANT'
        };
      case 'MULTI_PLATINUM':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          gradient: 'from-cyan-500/20 via-sky-950 to-slate-900',
          border: 'border-cyan-500/40 shadow-cyan-500/10',
          tag: 'MULTI-PLATINE'
        };
      case 'PLATINUM':
        return {
          badge: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
          gradient: 'from-slate-400/20 via-slate-800 to-slate-900',
          border: 'border-slate-400/40 shadow-slate-400/10',
          tag: 'PLATINE'
        };
      case 'GOLD':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gradient: 'from-amber-500/20 via-yellow-950 to-slate-900',
          border: 'border-amber-500/40 shadow-amber-500/10',
          tag: 'OR'
        };
      case 'SILVER':
      default:
        return {
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          gradient: 'from-slate-600/20 via-slate-800 to-slate-900',
          border: 'border-slate-500/30 shadow-slate-500/10',
          tag: 'ARGENT'
        };
    }
  };

  return (
    <div id="certifications-view" className="space-y-6 pb-28">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/20 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-8 top-6 opacity-10 hidden sm:block">
          <Award className="w-36 h-36 text-amber-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Chambre Officielle des Certifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certifications & Disques Homologués
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Attribution automatique des disques d\'Argent, d\'Or, de Platine et de Diamant selon les seuils d\'écoutes réels accumulés par vos titres favoris.
          </p>

          {/* Thresholds pill guide */}
          <div className="flex flex-wrap items-center gap-2 mt-5 text-xs">
            {Object.entries(CERTIFICATION_THRESHOLDS).map(([key, val]) => (
              <span
                key={key}
                className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center space-x-1.5"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: val.color }} />
                <span className="font-semibold">{val.label}</span>
                <span className="text-slate-400 font-mono">({val.streams} écoutes)</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Approaching next certification banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">En Route Vers la Prochaine Certification</h3>
          </div>
          <span className="text-xs text-slate-400">Progression continue</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nextMilestones.map(({ track, current, nextTier, progress }) => {
            if (!nextTier) return null;
            const tierMeta = CERTIFICATION_THRESHOLDS[nextTier.level];
            return (
              <div
                key={track.id}
                onClick={() => onOpenTrackPopup(track)}
                className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2.5 mb-2">
                  <img src={track.coverUrl} alt={track.title} className="w-9 h-9 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: tierMeta.color, backgroundColor: `${tierMeta.color}20` }}>
                    Objectif {tierMeta.label.replace('Disque d\'', '').replace('Disque de ', '')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: tierMeta.color
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-mono">
                  <span>{current} / {nextTier.required} scrobbles</span>
                  <span className="font-bold text-white">{Math.round(progress)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'DIAMOND', 'MULTI_PLATINUM', 'PLATINUM', 'GOLD', 'SILVER'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterLevel === lvl
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {lvl === 'ALL' && `Toutes (${certifications.length})`}
              {lvl === 'DIAMOND' && `Diamant (${certifications.filter((c) => c.level === 'DIAMOND').length})`}
              {lvl === 'MULTI_PLATINUM' && `Multi-Platine (${certifications.filter((c) => c.level === 'MULTI_PLATINUM').length})`}
              {lvl === 'PLATINUM' && `Platine (${certifications.filter((c) => c.level === 'PLATINUM').length})`}
              {lvl === 'GOLD' && `Or (${certifications.filter((c) => c.level === 'GOLD').length})`}
              {lvl === 'SILVER' && `Argent (${certifications.filter((c) => c.level === 'SILVER').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications Plaque Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCerts.map((cert) => {
          const style = getPlaqueStyle(cert.level);
          return (
            <div
              key={cert.id}
              onClick={() => triggerCelebration(cert)}
              className={`group relative rounded-xl border ${style.border} bg-gradient-to-b ${style.gradient} p-4 flex flex-col justify-between shadow-lg hover:scale-[1.02] transition-all cursor-pointer overflow-hidden`}
            >
              {/* Plaque Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${style.badge}`}>
                    {style.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {cert.dateAwarded || '2026'}
                  </span>
                </div>

                {/* Album Cover & Metallic Emblem */}
                <div className="relative mb-3 flex justify-center">
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden shadow-2xl border border-white/10 group-hover:shadow-indigo-500/20 transition-all">
                    <img src={cert.coverUrl} alt={cert.title} className="w-full h-full object-cover" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center shadow-lg">
                      <Disc3 className="w-6 h-6 text-amber-400 animate-spin-slow" />
                    </div>
                  </div>
                </div>

                {/* Plaque Description */}
                <div className="text-center">
                  <h3 className="font-bold text-sm text-white truncate">{cert.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{cert.artist}</p>
                </div>
              </div>

              {/* Plaque Bottom / Certificate number */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono text-[9px] text-slate-400 truncate max-w-[130px]">
                  {cert.certificateNumber}
                </span>
                <span className="font-bold text-slate-200">
                  {cert.currentStreams} streams
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Plaque Modal Preview */}
      {selectedPlaque && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full rounded-2xl bg-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl text-white">
            <button
              onClick={() => setSelectedPlaque(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Plaque Layout */}
            <div className="p-6 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/30 text-center shadow-inner relative overflow-hidden">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/30">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                CERTIFICAT OFFICIEL NOVASTAT
              </span>

              <h2 className="text-2xl font-black mt-2 text-white tracking-wide">
                DISQUE DE {getPlaqueStyle(selectedPlaque.level).tag}
              </h2>

              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Décerné en reconnaissance du succès critique et du volume certifié d\'écoutes.
              </p>

              <div className="my-5 flex justify-center">
                <img
                  src={selectedPlaque.coverUrl}
                  alt={selectedPlaque.title}
                  className="w-32 h-32 rounded-xl object-cover shadow-2xl border-2 border-white/20"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{selectedPlaque.title}</h3>
                <p className="text-sm font-medium text-amber-300">{selectedPlaque.artist}</p>
                <p className="text-xs text-slate-400 font-mono mt-2">
                  Seuil homologué : {selectedPlaque.streamsRequired} streams • Cumul : {selectedPlaque.currentStreams}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Certificat N° {selectedPlaque.certificateNumber}</span>
                <span>Délivré le {selectedPlaque.dateAwarded}</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  alert(`Certificat ${selectedPlaque.certificateNumber} copié dans le presse-papier !`);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>
              <button
                onClick={() => setSelectedPlaque(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
