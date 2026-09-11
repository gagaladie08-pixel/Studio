import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Radio,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Database
} from 'lucide-react';
import { NovaSettings } from '../types/novastat';

interface SettingsViewProps {
  settings: NovaSettings;
  onUpdateSettings: (settings: NovaSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData
}) => {
  const [localSettings, setLocalSettings] = useState<NovaSettings>(() => ({
    ...settings,
    blacklistedArtists: settings.blacklistedArtists || []
  }));
  const [newBlacklistTerm, setNewBlacklistTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleApp = (packageName: string) => {
    const updatedApps = (localSettings.playerApps || []).map((app) =>
      app.packageName === packageName ? { ...app, enabled: !app.enabled } : app
    );
    setLocalSettings({ ...localSettings, playerApps: updatedApps });
  };

  const handleAddBlacklist = () => {
    if (!newBlacklistTerm.trim()) return;
    const currentList = localSettings.blacklistedArtists || [];
    if (!currentList.includes(newBlacklistTerm.trim())) {
      setLocalSettings({
        ...localSettings,
        blacklistedArtists: [...currentList, newBlacklistTerm.trim()]
      });
      setNewBlacklistTerm('');
    }
  };

  const handleRemoveBlacklist = (term: string) => {
    const currentList = localSettings.blacklistedArtists || [];
    setLocalSettings({
      ...localSettings,
      blacklistedArtists: currentList.filter((t) => t !== term)
    });
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div id="settings-view" className="space-y-6 pb-28">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Configuration du Moteur Scrobbler</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Paramètres & Règles d\'Écoute
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Ajustez les seuils mathématiques de validation des scrobbles, les filtres antibruit et les applications autorisées.
            </p>
          </div>

          <button
            id="btn-save-settings"
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? 'Enregistré !' : 'Enregistrer les Réglages'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scrobble Thresholds Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Seuils de Validation du Scrobble</h3>
          </div>

          {/* Min Percentage */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-medium">
                Pourcentage minimum d\'écoute du morceau
              </span>
              <span className="font-mono font-bold text-indigo-400">
                {localSettings.minPercentageToScrobble}%
              </span>
            </div>
            <input
              aria-label="Pourcentage minimum d'écoute du morceau"
              type="range"
              min={25}
              max={90}
              step={5}
              value={localSettings.minPercentageToScrobble}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, minPercentageToScrobble: Number(e.target.value) })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Règle par défaut : 50%. Un titre de 3 minutes sera validé après 1m30s de lecture continue.
            </p>
          </div>

          {/* Min Duration Seconds */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-medium">
                Durée plancher absolue (secondes)
              </span>
              <span className="font-mono font-bold text-indigo-400">
                {localSettings.minDurationSeconds} sec
              </span>
            </div>
            <input
              aria-label="Durée plancher absolue en secondes"
              type="range"
              min={15}
              max={60}
              step={5}
              value={localSettings.minDurationSeconds}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, minDurationSeconds: Number(e.target.value) })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Validation prioritaire dès que le titre dépasse ce temps d\'écoute, même pour les longues pièces musicales.
            </p>
          </div>

          {/* Sound Notification */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                Notification sonore de scrobble
              </span>
              <span className="text-[11px] text-slate-400">
                Émettre un léger carillon lors de la validation
              </span>
            </div>
            <input
              aria-label="Notification sonore de scrobble"
              type="checkbox"
              checked={localSettings.soundNotification}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, soundNotification: e.target.checked })
              }
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Blacklist & Exclusion Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Liste Noire & Filtres d\'Exclusion</h3>
          </div>

          <p className="text-xs text-slate-400">
            Les titres ou artistes contenant ces mots-clés seront ignorés pour préserver l\'intégrité de vos classements (bruits blancs, podcasts, sons d\'ambiance).
          </p>

          {/* Add input */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ex: Bruits Blancs, ASMR, Méditation..."
              value={newBlacklistTerm}
              onChange={(e) => setNewBlacklistTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBlacklist()}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddBlacklist}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

          {/* Blacklist tags */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {(localSettings.blacklistedArtists || []).map((term) => (
              <span
                key={term}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center space-x-1.5"
              >
                <span>{term}</span>
                <button
                  onClick={() => handleRemoveBlacklist(term)}
                  className="p-0.5 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Authorized Player Apps Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Lecteurs Multimédia Captés</h3>
          </div>

          <div className="space-y-3">
            {localSettings.playerApps.map((app) => (
              <div
                key={app.packageName}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{app.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{app.packageName}</p>
                </div>
                <input
                  aria-label={`Activer le lecteur ${app.name}`}
                  type="checkbox"
                  checked={app.enabled}
                  onChange={() => handleToggleApp(app.packageName)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Database & Reset Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Database className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base text-white">Maintenance de la Base Locale</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Réinitialisez les données locales en rechargeant le catalogue de base avec les morceaux et certifications initiales de démonstration.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment réinitialiser toutes les données aux valeurs par défaut ?')) {
                  onResetData();
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurer les données d\'origine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
