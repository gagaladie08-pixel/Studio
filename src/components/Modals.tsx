import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  CalendarCheck,
  Download,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Track, BillboardEntry, NovaSettings } from '../types/novastat';
import { exportDatabaseJSON, importDatabaseJSON, parseSpotifyHistory, AppState } from '../services/storage';

interface ModalsProps {
  // Scrobble Modal
  isScrobbleModalOpen: boolean;
  onCloseScrobbleModal: () => void;
  onAddManualScrobble: (title: string, artist: string, album: string, durationSec: number) => void;

  // Snapshot Modal
  isSnapshotModalOpen: boolean;
  onCloseSnapshotModal: () => void;
  onConfirmCloseWeek: () => void;
  currentBillboard: BillboardEntry[];

  // Export / Import Modal
  isExportModalOpen: boolean;
  onCloseExportModal: () => void;
  appState: AppState;
  onRestoreState: (newState: Partial<AppState>) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  isScrobbleModalOpen,
  onCloseScrobbleModal,
  onAddManualScrobble,
  isSnapshotModalOpen,
  onCloseSnapshotModal,
  onConfirmCloseWeek,
  currentBillboard,
  isExportModalOpen,
  onCloseExportModal,
  appState,
  onRestoreState
}) => {
  // Scrobble modal form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [durationSec, setDurationSec] = useState(210);

  // Import feedback
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmitScrobble = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;
    onAddManualScrobble(title.trim(), artist.trim(), album.trim() || 'Single', durationSec);
    setTitle('');
    setArtist('');
    setAlbum('');
    onCloseScrobbleModal();
  };

  const handleDownloadBackup = () => {
    const jsonString = exportDatabaseJSON(appState);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novastat-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSpotify: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (isSpotify) {
          const { tracks, scrobbles } = parseSpotifyHistory(content);
          onRestoreState({
            tracks: [...appState.tracks, ...tracks],
            scrobbles: [...appState.scrobbles, ...scrobbles]
          });
          setImportStatus(`Succès : ${tracks.length} titres et ${scrobbles.length} scrobbles importés de Spotify !`);
          setIsError(false);
        } else {
          const restored = importDatabaseJSON(content);
          if (restored) {
            onRestoreState(restored);
            setImportStatus('Sauvegarde NovaStat restaurée avec succès !');
            setIsError(false);
          } else {
            throw new Error('Format de fichier invalide');
          }
        }
      } catch (err: unknown) {
        setIsError(true);
        setImportStatus(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* 1. Modal Scrobble Manuel */}
      {isScrobbleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <button
              onClick={onCloseScrobbleModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Simuler ou Ajouter un Scrobble</h2>
            </div>
            <p className="text-xs text-slate-400">
              Enregistre une écoute directement dans le moteur. Elle sera validée, comptera pour le Billboard et débloquera vos certifications.
            </p>

            <form onSubmit={handleSubmitScrobble} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Titre du morceau *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Starboy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Artiste *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: The Weeknd"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Album</label>
                <input
                  type="text"
                  placeholder="Ex: Starboy"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Durée (secondes)</label>
                <input
                  type="number"
                  min={30}
                  max={900}
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={onCloseScrobbleModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20"
                >
                  Enregistrer l\'Écoute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Clôture de la Semaine (Snapshot) */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full rounded-2xl bg-slate-900 border border-amber-500/30 p-6 text-white shadow-2xl space-y-4">
            <button
              onClick={onCloseSnapshotModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Clôturer la Semaine & Générer le Snapshot</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cette action finalise le classement Hot 100 de la semaine en cours, archive l\'instantané dans l\'historique, fige les points et transfère les rangs comme rangs de référence pour la prochaine semaine.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Numéro 1 actuel :</span>
                <span className="font-bold text-amber-400">{currentBillboard[0]?.title || 'Aucun'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Artiste au sommet :</span>
                <span className="font-medium text-slate-200">{currentBillboard[0]?.artist || 'Aucun'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total titres classés :</span>
                <span className="font-mono text-indigo-300">{currentBillboard.length} titres</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={onCloseSnapshotModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Annuler
              </button>
              <button
                id="btn-confirm-snapshot"
                onClick={() => {
                  onConfirmCloseWeek();
                  onCloseSnapshotModal();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold shadow-lg transition-all"
              >
                Confirmer la Clôture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Export / Backup & Import */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5">
            <button
              onClick={onCloseExportModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Sauvegarde & Import de Données</h2>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                  isError
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                <span>{importStatus}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Export Button */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Exporter la Base NovaStat (JSON)</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Téléchargez un fichier complet incluant scrobbles, classements et certifications.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger</span>
                </button>
              </div>

              {/* Import NovaStat Backup */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Restaurer une Sauvegarde NovaStat</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Chargez un fichier `.json` préalablement exporté.
                  </p>
                </div>
                <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Restaurer</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Import Spotify StreamingHistory.json */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Importer l\'Historique Spotify</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Chargez un fichier officiel Spotify `StreamingHistory.json` ou `Streaming_History_Audio.json`.
                  </p>
                </div>
                <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Importer Spotify</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
