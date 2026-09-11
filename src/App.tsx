/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar, TabType } from './components/Navbar';
import { NowPlayingBar } from './components/NowPlayingBar';
import { BillboardView } from './components/BillboardView';
import { CertificationsView } from './components/CertificationsView';
import { PantheonView } from './components/PantheonView';
import { RecordsView } from './components/RecordsView';
import { AwardsView } from './components/AwardsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { KotlinStudioView } from './components/KotlinStudioView';
import { Popups } from './components/Popups';
import { Modals } from './components/Modals';

import {
  Track,
  Scrobble,
  BillboardEntry,
  BillboardSnapshot,
  Certification,
  RecordItem,
  NovaSettings
} from './types/novastat';
import {
  loadStoredState,
  saveState,
  AppState
} from './services/storage';
import {
  computeBillboardRankings,
  evaluateCertifications,
  evaluateRecords,
  closeWeeklySnapshot
} from './services/scrobbleEngine';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadStoredState());
  const [activeTab, setActiveTab] = useState<TabType>('billboard');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Popups State
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<{ title: string; artist: string } | null>(null);

  // Modals State
  const [isScrobbleModalOpen, setIsScrobbleModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Celebration Alert State
  const [toastNotification, setToastNotification] = useState<{
    type: 'CERTIFICATION' | 'RECORD' | 'SNAPSHOT';
    title: string;
    subtitle: string;
  } | null>(null);

  // Save to persistence whenever state changes
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  const currentTrack = appState.tracks[currentTrackIndex] || appState.tracks[0] || null;

  // Handle validated scrobble (from NowPlayingBar or manual modal)
  const handleScrobbleValidated = (
    track: Track,
    playerPackage: string,
    listenedMs: number
  ) => {
    // 1. Check blacklist
    const blacklist = appState.settings?.blacklistedArtists || [];
    const isBlacklisted = blacklist.some((term) =>
      track.artist.toLowerCase().includes(term.toLowerCase()) ||
      track.title.toLowerCase().includes(term.toLowerCase())
    );
    if (isBlacklisted) return;

    // 2. Create new Scrobble record
    const newScrobble: Scrobble = {
      id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      timestamp: Date.now(),
      durationMs: track.durationMs,
      durationListenedMs: listenedMs,
      playerPackage,
      coverUrl: track.coverUrl,
      validated: true
    };

    // 3. Update track stats
    const updatedTracks = appState.tracks.map((t) => {
      if (t.id === track.id) {
        return {
          ...t,
          scrobblesCount: t.scrobblesCount + 1,
          lastScrobbleDate: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    const updatedScrobbles = [newScrobble, ...appState.scrobbles];

    // 4. Update Billboard rankings
    const updatedBillboard = computeBillboardRankings(
      updatedTracks,
      updatedScrobbles.slice(0, 100),
      appState.snapshots[0]
    );

    // 5. Evaluate certifications
    const targetTrack = updatedTracks.find((t) => t.id === track.id) || track;
    const newCerts = evaluateCertifications(targetTrack, appState.certifications);
    let updatedCerts = appState.certifications;

    if (newCerts.length > 0) {
      updatedCerts = [...newCerts, ...appState.certifications];
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setToastNotification({
        type: 'CERTIFICATION',
        title: `🏆 Nouvelle Certification Débloquée !`,
        subtitle: `${newCerts[0].title} de ${newCerts[0].artist} obtient le ${newCerts[0].level} !`
      });
      setTimeout(() => setToastNotification(null), 5000);
    }

    // 6. Evaluate records
    const brokenRecords = evaluateRecords(updatedTracks, updatedScrobbles, appState.records);
    let updatedRecords = appState.records;
    if (brokenRecords.length > 0) {
      updatedRecords = appState.records.map((r) => {
        const match = brokenRecords.find((b) => b.id === r.id);
        return match || r;
      });
      setToastNotification({
        type: 'RECORD',
        title: `⚡ Record Battu !`,
        subtitle: `${brokenRecords[0].title} : ${brokenRecords[0].valueFormatted}`
      });
      setTimeout(() => setToastNotification(null), 5000);
    }

    setAppState((prev) => ({
      ...prev,
      tracks: updatedTracks,
      scrobbles: updatedScrobbles,
      currentBillboard: updatedBillboard.length > 0 ? updatedBillboard : prev.currentBillboard,
      certifications: updatedCerts,
      records: updatedRecords
    }));
  };

  // Next Track in Player
  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % appState.tracks.length);
  };

  // Play a specific track
  const handlePlayTrack = (track: Track) => {
    const idx = appState.tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    } else {
      setAppState((prev) => ({ ...prev, tracks: [track, ...prev.tracks] }));
      setCurrentTrackIndex(0);
    }
  };

  // Manual Scrobble addition
  const handleAddManualScrobble = (title: string, artist: string, album: string, durationSec: number) => {
    let existing = appState.tracks.find(
      (t) => t.title.toLowerCase() === title.toLowerCase() && t.artist.toLowerCase() === artist.toLowerCase()
    );

    if (!existing) {
      existing = {
        id: `trk-${Date.now()}`,
        title,
        artist,
        album,
        durationMs: durationSec * 1000,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        scrobblesCount: 0,
        firstScrobbleDate: new Date().toISOString().split('T')[0],
        lastScrobbleDate: new Date().toISOString().split('T')[0]
      };
      setAppState((prev) => ({ ...prev, tracks: [existing!, ...prev.tracks] }));
    }

    handleScrobbleValidated(existing, 'com.spotify.music', durationSec * 1000);
  };

  // Weekly Billboard Snapshot Closure
  const handleConfirmCloseWeek = () => {
    const calendar = new Date();
    const weekNumber = Math.ceil((calendar.getTime() - new Date(calendar.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekId = `W${weekNumber}-${calendar.getFullYear()}`;

    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const newSnapshot = closeWeeklySnapshot(weekId, startDate, endDate, appState.currentBillboard);

    // Recompute current billboard with new baseline
    const freshBillboard = appState.currentBillboard.map((item) => ({
      ...item,
      previousRank: item.rank,
      trend: 'EQUAL' as const,
      changeAmount: 0
    }));

    setAppState((prev) => ({
      ...prev,
      snapshots: [newSnapshot, ...prev.snapshots],
      currentBillboard: freshBillboard
    }));

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });

    setToastNotification({
      type: 'SNAPSHOT',
      title: `📅 Semaine ${weekId} Archivée !`,
      subtitle: `Top #1 : ${newSnapshot.topTrack} de ${newSnapshot.topArtist}`
    });
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Restore State
  const handleRestoreState = (restored: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...restored }));
  };

  // Reset to default seed
  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Determine theme background
  const getThemeBackground = () => {
    switch (appState.settings.theme) {
      case 'oled':
        return 'bg-black text-white';
      case 'cyber':
        return 'bg-slate-950 text-cyan-50';
      case 'gold':
        return 'bg-[#0f0e0c] text-amber-50';
      case 'sunset':
        return 'bg-[#120a16] text-rose-50';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBackground()} font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300`}>
      {/* Toast / Notification Banner */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl backdrop-blur-md flex items-center space-x-3 text-white">
            <span className="text-2xl">
              {toastNotification.type === 'CERTIFICATION' ? '🏆' : toastNotification.type === 'RECORD' ? '⚡' : '📅'}
            </span>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-amber-400">{toastNotification.title}</h4>
              <p className="text-xs text-slate-200 mt-0.5 truncate">{toastNotification.subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenScrobbleModal={() => setIsScrobbleModalOpen(true)}
        onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        settings={appState.settings}
        onThemeChange={(theme) =>
          setAppState((prev) => ({ ...prev, settings: { ...prev.settings, theme } }))
        }
        activeTrackTitle={currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : undefined}
        isStreaming={true}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'billboard' && (
          <BillboardView
            currentEntries={appState.currentBillboard}
            snapshots={appState.snapshots}
            tracks={appState.tracks}
            onPlayTrack={handlePlayTrack}
            onOpenTrackPopup={setSelectedTrack}
            onTriggerCloseWeek={() => setIsSnapshotModalOpen(true)}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationsView
            certifications={appState.certifications}
            tracks={appState.tracks}
            onOpenTrackPopup={setSelectedTrack}
          />
        )}

        {activeTab === 'pantheon' && (
          <PantheonView
            pantheon={appState.pantheon}
            tracks={appState.tracks}
          />
        )}

        {activeTab === 'records' && (
          <RecordsView records={appState.records} />
        )}

        {activeTab === 'awards' && (
          <AwardsView awards={appState.awards} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            tracks={appState.tracks}
            scrobbles={appState.scrobbles}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            tracks={appState.tracks}
            scrobbles={appState.scrobbles}
            onPlayTrack={handlePlayTrack}
            onOpenTrackPopup={setSelectedTrack}
            onOpenArtistPopup={setSelectedArtist}
            onOpenAlbumPopup={(title, artist) => setSelectedAlbum({ title, artist })}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={appState.settings}
            onUpdateSettings={(settings) => setAppState((prev) => ({ ...prev, settings }))}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'kotlin' && (
          <KotlinStudioView />
        )}
      </main>

      {/* Floating Bottom Now Playing & Live Scrobbler */}
      <NowPlayingBar
        currentTrack={currentTrack}
        onNextTrack={handleNextTrack}
        onScrobbleValidated={handleScrobbleValidated}
        settings={appState.settings}
        onOpenTrackPopup={setSelectedTrack}
      />

      {/* Popups (Track, Artist, Album) */}
      <Popups
        selectedTrack={selectedTrack}
        selectedArtist={selectedArtist}
        selectedAlbum={selectedAlbum}
        allTracks={appState.tracks}
        certifications={appState.certifications}
        onClose={() => {
          setSelectedTrack(null);
          setSelectedArtist(null);
          setSelectedAlbum(null);
        }}
        onPlayTrack={handlePlayTrack}
      />

      {/* Action Modals */}
      <Modals
        isScrobbleModalOpen={isScrobbleModalOpen}
        onCloseScrobbleModal={() => setIsScrobbleModalOpen(false)}
        onAddManualScrobble={handleAddManualScrobble}
        isSnapshotModalOpen={isSnapshotModalOpen}
        onCloseSnapshotModal={() => setIsSnapshotModalOpen(false)}
        onConfirmCloseWeek={handleConfirmCloseWeek}
        currentBillboard={appState.currentBillboard}
        isExportModalOpen={isExportModalOpen}
        onCloseExportModal={() => setIsExportModalOpen(false)}
        appState={appState}
        onRestoreState={handleRestoreState}
      />
    </div>
  );
}
