export type CertificationLevel = 'SILVER' | 'GOLD' | 'PLATINUM' | 'MULTI_PLATINUM' | 'DIAMOND';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  coverUrl: string;
  genre?: string;
  releaseYear?: number;
  scrobblesCount: number;
  firstScrobbleDate: string;
  lastScrobbleDate: string;
}

export interface Scrobble {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  album: string;
  timestamp: number; // Unix timestamp in ms
  durationMs: number;
  durationListenedMs: number;
  playerPackage: string; // e.g., 'com.spotify.music', 'deezer.android.app'
  coverUrl: string;
  validated: boolean;
}

export interface BillboardEntry {
  rank: number;
  previousRank: number | null;
  peakRank: number;
  weeksOnChart: number;
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string;
  weeklyStreams: number;
  points: number;
  trend: 'UP' | 'DOWN' | 'EQUAL' | 'NEW' | 'REENTRY';
  changeAmount: number; // +2, -4, etc.
}

export interface BillboardSnapshot {
  weekId: string; // e.g., '2026-W36'
  startDate: string;
  endDate: string;
  closedAt: string;
  entries: BillboardEntry[];
  topArtist: string;
  topTrack: string;
  totalStreams: number;
}

export interface Certification {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  level: CertificationLevel;
  streamsRequired: number;
  currentStreams: number;
  dateAwarded?: string;
  certificateNumber: string;
  coverUrl: string;
}

export interface RecordItem {
  id: string;
  type: 'DAILY_STREAMS_ARTIST' | 'DAILY_STREAMS_TRACK' | 'LONGEST_STREAK_DAYS' | 'TOTAL_HOURS_LISTENED' | 'MOST_BILLBOARD_ENTRIES';
  title: string;
  description: string;
  holder: string; // Artist or track or 'Utilisateur'
  valueFormatted: string;
  dateAchieved: string;
  previousValueFormatted?: string;
  isNew?: boolean;
}

export interface Award {
  id: string;
  category: string;
  period: string; // e.g., '2025' or 'Août 2026'
  winnerName: string;
  winnerSubtitle: string;
  coverUrl: string;
  metrics: string;
  trophyType: 'GOLD' | 'CRYSTAL' | 'PLATINUM';
}

export interface PantheonMember {
  id: string;
  artist: string;
  inductedYear: number;
  reason: string;
  totalScrobbles: number;
  numberOneHits: number;
  topAlbum: string;
  avatarUrl: string;
  badges: string[];
}

export interface PlayerApp {
  packageName: string;
  name: string;
  enabled: boolean;
  color: string;
  iconName: string;
}

export interface NovaSettings {
  minDurationSeconds: number; // default 30s
  minPercentageToScrobble: number; // default 50%
  autoSnapshotWeekly: boolean;
  theme: 'dark' | 'oled' | 'cyber' | 'gold' | 'sunset';
  enableNotifications: boolean;
  playerApps: PlayerApp[];
  blacklistedArtists: string[];
}
