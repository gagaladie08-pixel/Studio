import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Flame,
  Award,
  Play,
  CheckCircle,
  Archive,
  BarChart2
} from 'lucide-react';
import { BillboardEntry, BillboardSnapshot, Track } from '../types/novastat';

interface BillboardViewProps {
  currentEntries: BillboardEntry[];
  snapshots: BillboardSnapshot[];
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onOpenTrackPopup: (track: Track) => void;
  onTriggerCloseWeek: () => void;
}

export const BillboardView: React.FC<BillboardViewProps> = ({
  currentEntries,
  snapshots,
  tracks,
  onPlayTrack,
  onOpenTrackPopup,
  onTriggerCloseWeek
}) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('current');
  const [viewMode, setViewMode] = useState<'tracks' | 'albums'>('tracks');

  // Select active entries
  const isCurrent = selectedSnapshotId === 'current';
  const activeSnapshot = snapshots.find((s) => s.weekId === selectedSnapshotId);
  const activeEntries = isCurrent ? currentEntries : activeSnapshot?.entries || [];

  const handleTrackClick = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track) onOpenTrackPopup(track);
  };

  const handlePlay = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    const track = tracks.find((t) => t.id === trackId);
    if (track) onPlayTrack(track);
  };

  return (
    <div id="billboard-view" className="space-y-6 pb-28">
      {/* Billboard Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-10 hidden sm:block">
          <BarChart2 className="w-36 h-36 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Le Classement Officiel NovaStat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nova Hot 100 • {isCurrent ? 'Semaine en cours (Temps réel)' : `Archive ${activeSnapshot?.weekId}`}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Les titres les plus écoutés, classés par points de streaming réels, régularité d\'écoute et vitesse de rotation.
            </p>
          </div>

          {/* Quick Actions & Snapshot Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <select
                aria-label="Sélectionner la semaine du Billboard"
                value={selectedSnapshotId}
                onChange={(e) => setSelectedSnapshotId(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="current" className="bg-slate-900 text-white">
                  🔥 Semaine Active (Live)
                </option>
                {snapshots.map((snap) => (
                  <option key={snap.weekId} value={snap.weekId} className="bg-slate-900 text-white">
                    📅 {snap.weekId} ({snap.startDate} au {snap.endDate})
                  </option>
                ))}
              </select>
            </div>

            {isCurrent && (
              <button
                id="btn-billboard-close-snapshot"
                onClick={onTriggerCloseWeek}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl shadow-md transition-all"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Clôturer & Sauvegarder</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">#1 Cette Semaine</span>
            <span className="font-bold text-amber-400 text-sm truncate block">
              {activeEntries[0]?.title || 'Aucun'}
            </span>
            <span className="text-slate-400 text-[11px] truncate block">{activeEntries[0]?.artist || ''}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Volume Streams Top 10</span>
            <span className="font-bold text-white text-sm">
              {activeEntries.reduce((acc, curr) => acc + curr.weeklyStreams, 0)} écoutes
            </span>
            <span className="text-emerald-400 text-[11px] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" /> +14.2% vs S-1
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Meilleure Entrée</span>
            <span className="font-bold text-indigo-300 text-sm truncate block">
              {activeEntries.find((e) => e.trend === 'NEW')?.title || 'Aucune entrée'}
            </span>
            <span className="text-slate-400 text-[11px] truncate block">
              {activeEntries.find((e) => e.trend === 'NEW')?.artist || ''}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Plus Grande Progression</span>
            <span className="font-bold text-emerald-400 text-sm truncate block">
              {(() => {
                const upList = [...activeEntries].filter((e) => e.trend === 'UP').sort((a, b) => b.changeAmount - a.changeAmount);
                return upList[0] ? `${upList[0].title} (+${upList[0].changeAmount})` : 'Stable';
              })()}
            </span>
            <span className="text-slate-400 text-[11px]">Progression de rang</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeEntries.slice(0, 3).map((entry, idx) => {
          const medals = ['🥇', '🥈', '🥉'];
          const borders = [
            'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-slate-900',
            'border-slate-400/40 bg-gradient-to-b from-slate-400/10 to-slate-900',
            'border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-slate-900'
          ];
          return (
            <div
              key={entry.trackId}
              onClick={() => handleTrackClick(entry.trackId)}
              className={`p-4 rounded-xl border ${borders[idx]} flex items-center space-x-4 cursor-pointer hover:scale-[1.01] transition-transform relative`}
            >
              <span className="text-2xl">{medals[idx]}</span>
              <img
                src={entry.coverUrl}
                alt={entry.title}
                className="w-16 h-16 rounded-lg object-cover shadow-lg flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-amber-400">#{entry.rank}</span>
                  <h3 className="text-sm font-bold text-white truncate">{entry.title}</h3>
                </div>
                <p className="text-xs text-slate-400 truncate">{entry.artist}</p>
                <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-indigo-300">{entry.points} pts</span>
                  <span>•</span>
                  <span>{entry.weeklyStreams} streams</span>
                </div>
              </div>
              <button
                aria-label={`Lire ${entry.title}`}
                onClick={(e) => handlePlay(e, entry.trackId)}
                className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Billboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">Classement Intégral</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {activeEntries.length} titres classés
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Formule : <span className="font-mono text-slate-300">Streams × 10 + Bonus Répétition</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rang</th>
                <th className="py-3 px-3 w-16 text-center">Évolution</th>
                <th className="py-3 px-4">Titre & Artiste</th>
                <th className="py-3 px-4 text-center">Streams S</th>
                <th className="py-3 px-4 text-center">Points</th>
                <th className="py-3 px-4 text-center">Meilleur Rang</th>
                <th className="py-3 px-4 text-center">Semaines</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeEntries.map((entry) => (
                <tr
                  key={entry.trackId}
                  onClick={() => handleTrackClick(entry.trackId)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 text-center font-bold text-base text-white">
                    {entry.rank}
                  </td>

                  {/* Trend Indicator */}
                  <td className="py-3.5 px-3 text-center">
                    {entry.trend === 'NEW' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        NEW
                      </span>
                    )}
                    {entry.trend === 'REENTRY' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        RE
                      </span>
                    )}
                    {entry.trend === 'UP' && (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-400 space-x-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{entry.changeAmount}</span>
                      </span>
                    )}
                    {entry.trend === 'DOWN' && (
                      <span className="inline-flex items-center text-xs font-semibold text-rose-400 space-x-0.5">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{entry.changeAmount}</span>
                      </span>
                    )}
                    {entry.trend === 'EQUAL' && (
                      <span className="inline-flex items-center text-xs font-semibold text-slate-500">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Track Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={entry.coverUrl}
                        alt={entry.title}
                        className="w-10 h-10 rounded-md object-cover shadow group-hover:opacity-80 transition-opacity flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors block truncate max-w-xs sm:max-w-md">
                          {entry.title}
                        </span>
                        <span className="text-xs text-slate-400 block truncate">{entry.artist}</span>
                      </div>
                    </div>
                  </td>

                  {/* Streams */}
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-200">
                    {entry.weeklyStreams}
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-300">
                    {entry.points}
                  </td>

                  {/* Peak */}
                  <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                    #{entry.peakRank}
                  </td>

                  {/* Weeks on Chart */}
                  <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                    {entry.weeksOnChart} sem.
                  </td>

                  {/* Play Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      aria-label={`Écouter ${entry.title}`}
                      onClick={(e) => handlePlay(e, entry.trackId)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                      title="Écouter dans le simulateur"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
