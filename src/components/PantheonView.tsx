import React from 'react';
import {
  Landmark,
  Crown,
  Sparkles,
  Trophy,
  Flame,
  Award,
  Disc3,
  Calendar
} from 'lucide-react';
import { PantheonMember, Track } from '../types/novastat';

interface PantheonViewProps {
  pantheon: PantheonMember[];
  tracks: Track[];
  onInductArtist?: (member: PantheonMember) => void;
}

export const PantheonView: React.FC<PantheonViewProps> = ({
  pantheon,
  tracks
}) => {
  return (
    <div id="pantheon-view" className="space-y-6 pb-28">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 border border-amber-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-8 -bottom-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-10 hidden sm:block">
          <Landmark className="w-40 h-40 text-amber-300" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Temple de la Renommée Musicale</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Le Panthéon NovaStat
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            L\'espace sacré honorant les artistes et œuvres ayant marqué de manière indélébile vos habitudes d\'écoute au fil des années.
          </p>

          <div className="flex items-center space-x-4 mt-4 text-xs text-amber-300/80 font-mono">
            <span>🏛️ {pantheon.length} Légendes Intronisées</span>
            <span>•</span>
            <span>⭐ Seuil d\'admission : 1 500+ scrobbles</span>
          </div>
        </div>
      </div>

      {/* Pantheon Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pantheon.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-amber-400/60 transition-all group"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            <div>
              {/* Header with year and icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Intronisé en {member.inductedYear}</span>
                </div>
                <Crown className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>

              {/* Avatar & Artist Name */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={member.avatarUrl}
                    alt={member.artist}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-slate-950 shadow">
                    <Trophy className="w-3 h-3 fill-slate-950" />
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors">
                    {member.artist}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Album phare : <span className="text-slate-300 font-medium">{member.topAlbum}</span>
                  </p>
                </div>
              </div>

              {/* Reason / Accolade */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 mb-4">
                « {member.reason} »
              </p>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <span className="block text-[10px] text-slate-400">Total Scrobbles</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {member.totalScrobbles.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <span className="block text-[10px] text-slate-400">Hits #1 Billboard</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    {member.numberOneHits} titres
                  </span>
                </div>
              </div>
            </div>

            {/* Badges pills */}
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
              {member.badges.map((badge, bIdx) => (
                <span
                  key={bIdx}
                  className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-medium border border-amber-500/20 flex items-center space-x-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
