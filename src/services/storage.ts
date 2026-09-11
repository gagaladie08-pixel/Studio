import {
  Track,
  Scrobble,
  BillboardEntry,
  BillboardSnapshot,
  Certification,
  RecordItem,
  Award,
  PantheonMember,
  NovaSettings
} from '../types/novastat';
import {
  INITIAL_TRACKS,
  INITIAL_SCROBBLES,
  INITIAL_CERTIFICATIONS,
  INITIAL_RECORDS,
  INITIAL_AWARDS,
  INITIAL_PANTHEON,
  INITIAL_SETTINGS,
  INITIAL_HISTORICAL_SNAPSHOTS,
  INITIAL_CURRENT_WEEK_ENTRIES
} from '../data/initialData';

const STORAGE_KEYS = {
  TRACKS: 'novastat_tracks',
  SCROBBLES: 'novastat_scrobbles',
  BILLBOARD_CURRENT: 'novastat_billboard_current',
  BILLBOARD_SNAPSHOTS: 'novastat_billboard_snapshots',
  CERTIFICATIONS: 'novastat_certifications',
  RECORDS: 'novastat_records',
  AWARDS: 'novastat_awards',
  PANTHEON: 'novastat_pantheon',
  SETTINGS: 'novastat_settings'
};

export interface AppState {
  tracks: Track[];
  scrobbles: Scrobble[];
  currentBillboard: BillboardEntry[];
  snapshots: BillboardSnapshot[];
  certifications: Certification[];
  records: RecordItem[];
  awards: Award[];
  pantheon: PantheonMember[];
  settings: NovaSettings;
}

export function loadStoredState(): AppState {
  try {
    const tracks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACKS) || 'null') || INITIAL_TRACKS;
    const scrobbles = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCROBBLES) || 'null') || INITIAL_SCROBBLES;
    const currentBillboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLBOARD_CURRENT) || 'null') || INITIAL_CURRENT_WEEK_ENTRIES;
    const snapshots = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLBOARD_SNAPSHOTS) || 'null') || INITIAL_HISTORICAL_SNAPSHOTS;
    const certifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS) || 'null') || INITIAL_CERTIFICATIONS;
    const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || 'null') || INITIAL_RECORDS;
    const awards = JSON.parse(localStorage.getItem(STORAGE_KEYS.AWARDS) || 'null') || INITIAL_AWARDS;
    const pantheon = JSON.parse(localStorage.getItem(STORAGE_KEYS.PANTHEON) || 'null') || INITIAL_PANTHEON;
    const rawSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null');
    const settings: NovaSettings = {
      ...INITIAL_SETTINGS,
      ...(rawSettings || {}),
      blacklistedArtists: Array.isArray(rawSettings?.blacklistedArtists)
        ? rawSettings.blacklistedArtists
        : INITIAL_SETTINGS.blacklistedArtists,
      playerApps: Array.isArray(rawSettings?.playerApps) && rawSettings.playerApps.length > 0
        ? rawSettings.playerApps
        : INITIAL_SETTINGS.playerApps
    };

    return {
      tracks,
      scrobbles,
      currentBillboard,
      snapshots,
      certifications,
      records,
      awards,
      pantheon,
      settings
    };
  } catch (e) {
    console.error('Error loading stored state, using default values', e);
    return {
      tracks: INITIAL_TRACKS,
      scrobbles: INITIAL_SCROBBLES,
      currentBillboard: INITIAL_CURRENT_WEEK_ENTRIES,
      snapshots: INITIAL_HISTORICAL_SNAPSHOTS,
      certifications: INITIAL_CERTIFICATIONS,
      records: INITIAL_RECORDS,
      awards: INITIAL_AWARDS,
      pantheon: INITIAL_PANTHEON,
      settings: INITIAL_SETTINGS
    };
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(state.tracks));
    localStorage.setItem(STORAGE_KEYS.SCROBBLES, JSON.stringify(state.scrobbles));
    localStorage.setItem(STORAGE_KEYS.BILLBOARD_CURRENT, JSON.stringify(state.currentBillboard));
    localStorage.setItem(STORAGE_KEYS.BILLBOARD_SNAPSHOTS, JSON.stringify(state.snapshots));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(state.certifications));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(state.records));
    localStorage.setItem(STORAGE_KEYS.AWARDS, JSON.stringify(state.awards));
    localStorage.setItem(STORAGE_KEYS.PANTHEON, JSON.stringify(state.pantheon));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));

    // Also notify native NovaBridge if embedded in Android WebView
    // @ts-expect-error Android WebView Bridge
    if (window.NovaBridge && typeof window.NovaBridge.onDataUpdated === 'function') {
      // @ts-expect-error Android WebView Bridge
      window.NovaBridge.onDataUpdated(JSON.stringify({ type: 'STATE_SAVED', timestamp: Date.now() }));
    }
  } catch (e) {
    console.error('Error saving state', e);
  }
}

export function exportDatabaseJSON(state: AppState): string {
  const exportPayload = {
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    generator: 'NovaStat Core Engine',
    data: state
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importDatabaseJSON(jsonStr: string): Partial<AppState> | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.data) {
      return parsed.data;
    }
    if (parsed.tracks || parsed.scrobbles) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse imported JSON', e);
    return null;
  }
}

/**
 * Parses Spotify streaming history JSON export format
 */
export function parseSpotifyHistory(jsonStr: string): { tracks: Track[]; scrobbles: Scrobble[] } {
  try {
    const rawItems: Array<{
      endTime?: string;
      ts?: string;
      artistName?: string;
      master_metadata_album_artist_name?: string;
      trackName?: string;
      master_metadata_track_name?: string;
      msPlayed?: number;
      ms_played?: number;
    }> = JSON.parse(jsonStr);

    const trackMap = new Map<string, Track>();
    const newScrobbles: Scrobble[] = [];

    const defaultCovers = [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80'
    ];

    rawItems.forEach((item, idx) => {
      const artist = item.artistName || item.master_metadata_album_artist_name || 'Inconnu';
      const title = item.trackName || item.master_metadata_track_name || 'Titre inconnu';
      const playedMs = item.msPlayed || item.ms_played || 180000;
      const dateStr = item.endTime || item.ts || new Date().toISOString();
      const timestamp = new Date(dateStr).getTime() || Date.now();

      // Only count meaningful listens (> 30s)
      if (playedMs < 30000) return;

      const trackKey = `${artist.toLowerCase()}_${title.toLowerCase()}`;
      let track = trackMap.get(trackKey);

      if (!track) {
        track = {
          id: `imp-${Math.abs(hashCode(trackKey))}`,
          title,
          artist,
          album: 'Import Spotify',
          durationMs: playedMs,
          coverUrl: defaultCovers[idx % defaultCovers.length],
          scrobblesCount: 0,
          firstScrobbleDate: dateStr.split('T')[0],
          lastScrobbleDate: dateStr.split('T')[0]
        };
        trackMap.set(trackKey, track);
      }

      track.scrobblesCount++;
      track.lastScrobbleDate = dateStr.split('T')[0];

      newScrobbles.push({
        id: `sc-imp-${idx}-${timestamp}`,
        trackId: track.id,
        title,
        artist,
        album: 'Import Spotify',
        timestamp,
        durationMs: playedMs,
        durationListenedMs: playedMs,
        playerPackage: 'com.spotify.music',
        coverUrl: track.coverUrl,
        validated: true
      });
    });

    return {
      tracks: Array.from(trackMap.values()),
      scrobbles: newScrobbles
    };
  } catch (e) {
    console.error('Error parsing Spotify file', e);
    throw new Error('Format de fichier Spotify invalide. Assurez-vous d\'importer StreamingHistory.json.');
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
