import React from 'react';
import {
  BarChart3,
  Award,
  Flame,
  Search,
  Settings,
  Trophy,
  PieChart,
  Landmark,
  Radio,
  FileCode2,
  CalendarCheck,
  PlusCircle,
  Download
} from 'lucide-react';
import { NovaSettings } from '../types/novastat';

export type TabType = 
  | 'billboard'
  | 'certifications'
  | 'pantheon'
  | 'records'
  | 'awards'
  | 'analytics'
  | 'search'
  | 'settings'
  | 'kotlin';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenScrobbleModal: () => void;
  onOpenSnapshotModal: () => void;
  onOpenExportModal: () => void;
  settings: NovaSettings;
  onThemeChange: (theme: NovaSettings['theme']) => void;
  activeTrackTitle?: string;
  isStreaming: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenScrobbleModal,
  onOpenSnapshotModal,
  onOpenExportModal,
  settings,
  onThemeChange,
  activeTrackTitle,
  isStreaming
}) => {
  const tabs = [
    { id: 'billboard', label: 'Billboard', icon: BarChart3 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'pantheon', label: 'Panthéon', icon: Landmark },
    { id: 'records', label: 'Records', icon: Flame },
    { id: 'awards', label: 'Awards', icon: Trophy },
    { id: 'analytics', label: 'Statistiques', icon: PieChart },
    { id: 'search', label: 'Recherche', icon: Search },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'kotlin', label: 'Code Android', icon: FileCode2 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('billboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-300">
                  NovaStat
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Moteur de classements, scrobbles et certifications
              </p>
            </div>
          </div>

          {/* Now Playing Live Ticker */}
          {activeTrackTitle && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStreaming ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-slate-400">En cours :</span>
              <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                {activeTrackTitle}
              </span>
            </div>
          )}

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Clôturer semaine / Snapshot */}
            <button
              id="btn-close-week"
              onClick={onOpenSnapshotModal}
              title="Clôturer la semaine et générer un Snapshot Billboard"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-lg hover:border-amber-400 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="hidden md:inline">Clôturer Semaine</span>
            </button>

            {/* Simuler / Enregistrer Scrobble */}
            <button
              id="btn-add-scrobble"
              onClick={onOpenScrobbleModal}
              title="Simuler ou ajouter une écoute"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Scrobbler</span>
            </button>

            {/* Exporter / Sauvegarder */}
            <button
              id="btn-backup"
              onClick={onOpenExportModal}
              title="Sauvegarde & Import"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Theme Dropdown */}
            <select
              aria-label="Thème de l'application"
              value={settings.theme}
              onChange={(e) => onThemeChange(e.target.value as NovaSettings['theme'])}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="dark">🌙 Sombre</option>
              <option value="oled">🖤 OLED</option>
              <option value="cyber">⚡ Cyber</option>
              <option value="gold">🏆 Or</option>
              <option value="sunset">🌅 Sunset</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
