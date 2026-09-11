import React from 'react';
import {
  Trophy,
  Award as AwardIcon,
  Crown,
  Sparkles,
  Calendar,
  Medal,
  Music
} from 'lucide-react';
import { Award } from '../types/novastat';

interface AwardsViewProps {
  awards: Award[];
}

export const AwardsView: React.FC<AwardsViewProps> = ({ awards }) => {
  const getTrophyColor = (type: Award['trophyType']) => {
    switch (type) {
      case 'GOLD':
        return {
          gradient: 'from-amber-500/20 via-yellow-950/30 to-slate-900',
          border: 'border-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconColor: 'text-amber-400'
        };
      case 'PLATINUM':
        return {
          gradient: 'from-slate-400/20 via-slate-800 to-slate-900',
          border: 'border-slate-400/40',
          badge: 'bg-slate-300/20 text-slate-200 border-slate-300/30',
          iconColor: 'text-slate-200'
        };
      case 'CRYSTAL':
      default:
        return {
          gradient: 'from-cyan-500/20 via-indigo-950 to-slate-900',
          border: 'border-cyan-500/40',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          iconColor: 'text-cyan-400'
        };
    }
  };

  return (
    <div id="awards-view" className="space-y-6 pb-28">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-purple-950 border border-amber-500/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-12 top-6 opacity-10 hidden sm:block">
          <Trophy className="w-36 h-36 text-amber-400" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Cérémonie Annuelle & Mensuelle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Les Nova Awards
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            La vitrine d\'excellence récompensant les artistes et albums ayant dominé vos sessions d\'écoute au terme de chaque mois et année civile.
          </p>
        </div>
      </div>

      {/* Trophy Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awards.map((award) => {
          const style = getTrophyColor(award.trophyType);
          return (
            <div
              key={award.id}
              className={`rounded-2xl border ${style.border} bg-gradient-to-b ${style.gradient} p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${style.badge}`}>
                    {award.period}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow">
                    <Trophy className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  {award.category}
                </span>

                <div className="flex items-center space-x-4 my-3">
                  <img
                    src={award.coverUrl}
                    alt={award.winnerName}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors truncate">
                      {award.winnerName}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 truncate">
                      {award.winnerSubtitle}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 mt-2">
                  <span className="font-medium text-amber-300/90 block mb-0.5">Faits marquants :</span>
                  <p>{award.metrics}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Medal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trophée {award.trophyType === 'GOLD' ? 'Or' : award.trophyType === 'PLATINUM' ? 'Platine' : 'Cristal'}</span>
                </span>
                <span className="text-indigo-400 font-medium">Homologué NovaStat</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
