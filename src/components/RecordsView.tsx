import React from 'react';
import {
  Flame,
  Trophy,
  History,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  Zap
} from 'lucide-react';
import { RecordItem } from '../types/novastat';

interface RecordsViewProps {
  records: RecordItem[];
}

export const RecordsView: React.FC<RecordsViewProps> = ({ records }) => {
  return (
    <div id="records-view" className="space-y-6 pb-28">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-950 via-slate-900 to-red-950 border border-orange-500/20 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-12 top-6 opacity-10 hidden sm:block">
          <Flame className="w-36 h-36 text-orange-400" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Statistiques Extrêmes & Records Historiques</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Le Livre des Records NovaStat
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Tous les sommets absolus atteints dans votre écoute musicale : marathons, pics en 24 heures et séries d\'écoutes consécutives.
          </p>
        </div>
      </div>

      {/* Primary Record Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((rec) => (
          <div
            key={rec.id}
            className={`p-5 rounded-2xl bg-slate-900 border ${
              rec.isNew
                ? 'border-orange-500/60 shadow-lg shadow-orange-500/10'
                : 'border-slate-800'
            } flex flex-col justify-between hover:border-slate-700 transition-colors`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{rec.title}</span>
                </span>
                {rec.isNew && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold border border-orange-500/40 animate-pulse">
                    NOUVEAU RECORD
                  </span>
                )}
              </div>

              <div className="my-2">
                <span className="text-2xl font-black text-white block">
                  {rec.valueFormatted}
                </span>
                <span className="text-xs font-medium text-orange-300 block mt-0.5 truncate">
                  Détenteur : {rec.holder}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {rec.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Établi le {rec.dateAchieved}</span>
              </span>
              {rec.previousValueFormatted && (
                <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  Précédent : {rec.previousValueFormatted}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Streak & Consistency Highlight Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
            <Flame className="w-8 h-8 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Série d\'écoute en cours</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Active aujourd\'hui
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vous avez scrobblé au moins 10 titres chaque jour sans interruption depuis plus de 4 mois !
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
            Streak Actuel
          </span>
          <span className="text-3xl font-black text-amber-400 font-mono">
            142 <span className="text-sm font-sans text-slate-300 font-normal">jours</span>
          </span>
        </div>
      </div>
    </div>
  );
};
