import {
  Track,
  Scrobble,
  BillboardEntry,
  BillboardSnapshot,
  Certification,
  CertificationLevel,
  RecordItem,
  NovaSettings
} from '../types/novastat';

export interface ScrobbleProcessResult {
  scrobble: Scrobble;
  updatedTrack: Track;
  unlockedCertifications: Certification[];
  brokenRecords: RecordItem[];
  updatedBillboard: BillboardEntry[];
}

export const CERTIFICATION_THRESHOLDS: Record<CertificationLevel, { streams: number; label: string; color: string }> = {
  SILVER: { streams: 100, label: 'Disque d\'Argent', color: '#CBD5E1' },
  GOLD: { streams: 250, label: 'Disque d\'Or', color: '#F59E0B' },
  PLATINUM: { streams: 500, label: 'Disque de Platine', color: '#94A3B8' },
  MULTI_PLATINUM: { streams: 800, label: 'Double / Multi-Platine', color: '#38BDF8' },
  DIAMOND: { streams: 1000, label: 'Disque de Diamant', color: '#EC4899' }
};

/**
 * Validates whether a listening session qualifies as a scrobble
 * Rule: >= 50% duration listened OR >= minDurationSeconds (e.g. 30s)
 */
export function isValidScrobble(
  durationListenedMs: number,
  trackDurationMs: number,
  settings: NovaSettings
): boolean {
  const durationSec = durationListenedMs / 1000;
  const percentage = (durationListenedMs / Math.max(1, trackDurationMs)) * 100;
  return durationSec >= settings.minDurationSeconds || percentage >= settings.minPercentageToScrobble;
}

/**
 * Calculates Billboard weekly score and ranks
 */
export function computeBillboardRankings(
  tracks: Track[],
  weeklyScrobbles: Scrobble[],
  previousSnapshot?: BillboardSnapshot
): BillboardEntry[] {
  // Aggregate weekly counts
  const countMap: Record<string, number> = {};
  for (const s of weeklyScrobbles) {
    if (s.validated) {
      countMap[s.trackId] = (countMap[s.trackId] || 0) + 1;
    }
  }

  // Calculate points
  const scoredItems = tracks
    .map((track) => {
      const weeklyStreams = countMap[track.id] || 0;
      // Formula: base points per stream + extra bonus for high replay concentration
      const points = weeklyStreams * 10 + Math.floor(Math.pow(weeklyStreams, 1.15) * 1.5);
      return { track, weeklyStreams, points };
    })
    .filter((item) => item.weeklyStreams > 0)
    .sort((a, b) => b.points - a.points);

  const prevEntriesMap = new Map<string, BillboardEntry>();
  if (previousSnapshot) {
    for (const entry of previousSnapshot.entries) {
      prevEntriesMap.set(entry.trackId, entry);
    }
  }

  return scoredItems.map((item, index) => {
    const currentRank = index + 1;
    const prev = prevEntriesMap.get(item.track.id);

    let trend: BillboardEntry['trend'] = 'NEW';
    let changeAmount = 0;
    let weeksOnChart = 1;
    let peakRank = currentRank;

    if (prev) {
      weeksOnChart = prev.weeksOnChart + 1;
      peakRank = Math.min(currentRank, prev.peakRank);
      if (prev.rank > currentRank) {
        trend = 'UP';
        changeAmount = prev.rank - currentRank;
      } else if (prev.rank < currentRank) {
        trend = 'DOWN';
        changeAmount = prev.rank - currentRank;
      } else {
        trend = 'EQUAL';
        changeAmount = 0;
      }
    } else {
      trend = 'NEW';
      changeAmount = 0;
    }

    return {
      rank: currentRank,
      previousRank: prev ? prev.rank : null,
      peakRank,
      weeksOnChart,
      trackId: item.track.id,
      title: item.track.title,
      artist: item.track.artist,
      coverUrl: item.track.coverUrl,
      weeklyStreams: item.weeklyStreams,
      points: item.points,
      trend,
      changeAmount
    };
  });
}

/**
 * Checks if a track just surpassed a certification tier
 */
export function evaluateCertifications(
  track: Track,
  currentCertifications: Certification[]
): Certification[] {
  const existingLevels = new Set(
    currentCertifications
      .filter((c) => c.trackId === track.id)
      .map((c) => c.level)
  );

  const newCerts: Certification[] = [];
  const levels: CertificationLevel[] = ['SILVER', 'GOLD', 'PLATINUM', 'MULTI_PLATINUM', 'DIAMOND'];

  for (const lvl of levels) {
    const req = CERTIFICATION_THRESHOLDS[lvl].streams;
    if (track.scrobblesCount >= req && !existingLevels.has(lvl)) {
      const certNum = `NS-${new Date().getFullYear()}-${lvl.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
      newCerts.push({
        id: `cert-${track.id}-${lvl}-${Date.now()}`,
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        level: lvl,
        streamsRequired: req,
        currentStreams: track.scrobblesCount,
        dateAwarded: new Date().toISOString().split('T')[0],
        certificateNumber: certNum,
        coverUrl: track.coverUrl
      });
    }
  }

  return newCerts;
}

/**
 * Check and evaluate records broken
 */
export function evaluateRecords(
  tracks: Track[],
  allScrobbles: Scrobble[],
  records: RecordItem[]
): RecordItem[] {
  const broken: RecordItem[] = [];

  // 1. Check Most Streamed Track in 24 hours
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;
  const last24hScrobbles = allScrobbles.filter((s) => s.timestamp >= last24h && s.validated);

  const track24hCounts: Record<string, number> = {};
  for (const s of last24hScrobbles) {
    track24hCounts[s.trackId] = (track24hCounts[s.trackId] || 0) + 1;
  }

  let topTrackId = '';
  let maxTrackCount = 0;
  for (const [tid, cnt] of Object.entries(track24hCounts)) {
    if (cnt > maxTrackCount) {
      maxTrackCount = cnt;
      topTrackId = tid;
    }
  }

  const trackRecord = records.find((r) => r.type === 'DAILY_STREAMS_TRACK');
  if (trackRecord && topTrackId) {
    const prevMax = parseInt(trackRecord.valueFormatted) || 0;
    if (maxTrackCount > prevMax && maxTrackCount >= 5) {
      const trk = tracks.find((t) => t.id === topTrackId);
      broken.push({
        ...trackRecord,
        holder: `${trk?.title || 'Titre'} (${trk?.artist || 'Artiste'})`,
        valueFormatted: `${maxTrackCount} répétitions`,
        previousValueFormatted: trackRecord.valueFormatted,
        dateAchieved: new Date().toISOString().split('T')[0],
        isNew: true
      });
    }
  }

  return broken;
}

/**
 * Closes the current week and produces a new historical BillboardSnapshot
 */
export function closeWeeklySnapshot(
  weekId: string,
  startDate: string,
  endDate: string,
  currentEntries: BillboardEntry[]
): BillboardSnapshot {
  const topEntry = currentEntries[0];
  const totalStreams = currentEntries.reduce((acc, curr) => acc + curr.weeklyStreams, 0);

  return {
    weekId,
    startDate,
    endDate,
    closedAt: new Date().toISOString(),
    entries: [...currentEntries],
    topArtist: topEntry ? topEntry.artist : 'Aucun',
    topTrack: topEntry ? topEntry.title : 'Aucun',
    totalStreams
  };
}
