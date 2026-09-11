import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Radio,
  Volume2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Track, PlayerApp, NovaSettings } from '../types/novastat';

interface NowPlayingBarProps {
  currentTrack: Track | null;
  onNextTrack: () => void;
  onScrobbleValidated: (track: Track, playerPackage: string, listenedMs: number) => void;
  settings: NovaSettings;
  onOpenTrackPopup: (track: Track) => void;
}

export const NowPlayingBar: React.FC<NowPlayingBarProps> = ({
  currentTrack,
  onNextTrack,
  onScrobbleValidated,
  settings,
  onOpenTrackPopup
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [listenedMs, setListenedMs] = useState(0);
  const defaultApp: PlayerApp = { packageName: 'com.spotify.music', name: 'Spotify', enabled: true, color: '#1DB954', iconName: 'spotify' };
  const appsList = settings?.playerApps?.length ? settings.playerApps : [defaultApp];
  const [selectedApp, setSelectedApp] = useState<PlayerApp>(appsList[0] || defaultApp);
  const [hasScrobbled, setHasScrobbled] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  // Refs to avoid calling parent setState inside setListenedMs updater
  const listenedMsRef = useRef(0);
  const hasScrobbledRef = useRef(false);

  // Keep selectedApp valid if settings change
  useEffect(() => {
    if (settings?.playerApps?.length && !settings.playerApps.some((a) => a.packageName === selectedApp.packageName)) {
      setSelectedApp(settings.playerApps[0]);
    }
  }, [settings?.playerApps, selectedApp.packageName]);

  // Reset when track changes
  useEffect(() => {
    listenedMsRef.current = 0;
    hasScrobbledRef.current = false;
    setListenedMs(0);
    setHasScrobbled(false);
    setIsPlaying(true);
  }, [currentTrack?.id]);

  // Tick simulation with side effects executed outside of React's render/state updater phase
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;

    const interval = setInterval(() => {
      const next = listenedMsRef.current + 1000;
      const total = currentTrack.durationMs;
      listenedMsRef.current = next;
      setListenedMs(next);

      // Check if scrobble qualification condition is met
      const durationSec = next / 1000;
      const percent = (next / total) * 100;
      const qualifies = durationSec >= settings.minDurationSeconds || percent >= settings.minPercentageToScrobble;

      if (qualifies && !hasScrobbledRef.current) {
        hasScrobbledRef.current = true;
        setHasScrobbled(true);
        setFlashSuccess(true);
        setTimeout(() => setFlashSuccess(false), 3000);
        onScrobbleValidated(currentTrack, selectedApp.packageName, next);
      }

      if (next >= total) {
        listenedMsRef.current = 0;
        hasScrobbledRef.current = false;
        setListenedMs(0);
        setHasScrobbled(false);
        onNextTrack();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, settings, selectedApp.packageName, onNextTrack, onScrobbleValidated]);

  if (!currentTrack) return null;

  const progressPercent = Math.min(100, (listenedMs / currentTrack.durationMs) * 100);
  const requiredPercent = settings.minPercentageToScrobble;

  const formatSeconds = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="now-playing-bar"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300 ${
        flashSuccess
          ? 'bg-slate-900 border-emerald-500/80 shadow-2xl shadow-emerald-500/20'
          : 'bg-slate-900/95 border-slate-800'
      } border-t backdrop-blur-xl text-white px-4 py-3`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Track Details */}
        <div className="flex items-center space-x-3 w-full md:w-1/3 min-w-0">
          <div
            onClick={() => onOpenTrackPopup(currentTrack)}
            className="relative cursor-pointer group flex-shrink-0"
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-13 h-13 rounded-lg object-cover shadow-md group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-lg transition-opacity">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4
                onClick={() => onOpenTrackPopup(currentTrack)}
                className="font-semibold text-sm truncate hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {currentTrack.title}
              </h4>
              {hasScrobbled && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Scrobblé</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {currentTrack.artist} • <span className="italic">{currentTrack.album}</span>
            </p>
          </div>
        </div>

        {/* Center: Controls & Progress Bar */}
        <div className="flex flex-col items-center w-full md:w-1/2 max-w-xl">
          <div className="flex items-center space-x-4 mb-1.5">
            <button
              id="btn-toggle-play"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-colors shadow"
              title={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-900" /> : <Play className="w-4 h-4 fill-slate-900 ml-0.5" />}
            </button>
            <button
              id="btn-skip-track"
              onClick={onNextTrack}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Piste suivante"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center space-x-1 text-slate-400 text-xs pl-2">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>Seuil de validation : 50% ou 30s</span>
            </div>
          </div>

          {/* Timeline with Scrobble Marker */}
          <div className="w-full flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>{formatSeconds(listenedMs)}</span>
            <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-visible">
              {/* Threshold indicator line at 50% */}
              <div
                style={{ left: `${requiredPercent}%` }}
                className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-amber-400 z-10"
                title={`Seuil de validation de scrobble (${requiredPercent}%)`}
              />
              {/* Progress bar */}
              <div
                style={{ width: `${progressPercent}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  hasScrobbled
                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    : 'bg-gradient-to-r from-indigo-600 to-amber-500'
                }`}
              />
            </div>
            <span>{formatSeconds(currentTrack.durationMs)}</span>
          </div>
        </div>

        {/* Right: Player source app select */}
        <div className="hidden md:flex items-center space-x-2 w-auto justify-end">
          <div className="flex items-center space-x-1.5 text-xs bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <select
              aria-label="Application source du scrobble"
              value={selectedApp.packageName}
              onChange={(e) => {
                const app = appsList.find((a) => a.packageName === e.target.value);
                if (app) setSelectedApp(app);
              }}
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer"
            >
              {appsList.map((app) => (
                <option key={app.packageName} value={app.packageName} className="bg-slate-800 text-white">
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Force Instant Scrobble Button */}
          <button
            id="btn-force-scrobble"
            onClick={() => {
              if (!hasScrobbledRef.current) {
                hasScrobbledRef.current = true;
                setHasScrobbled(true);
                setFlashSuccess(true);
                setTimeout(() => setFlashSuccess(false), 3000);
                onScrobbleValidated(currentTrack, selectedApp.packageName, currentTrack.durationMs);
              }
            }}
            className="text-xs px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center space-x-1 transition-colors"
            title="Valider immédiatement ce scrobble"
          >
            <Sparkles className="w-3 h-3" />
            <span>Valider</span>
          </button>
        </div>
      </div>
    </div>
  );
};
