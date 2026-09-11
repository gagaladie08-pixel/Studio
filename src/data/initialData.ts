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

export const INITIAL_SETTINGS: NovaSettings = {
  minDurationSeconds: 30,
  minPercentageToScrobble: 50,
  autoSnapshotWeekly: true,
  theme: 'dark',
  enableNotifications: true,
  blacklistedArtists: ['Bruit Blanc', 'White Noise', 'Pluie Relaxante', 'Sleep Sounds', 'ASMR Meditation'],
  playerApps: [
    { packageName: 'com.spotify.music', name: 'Spotify', enabled: true, color: '#1DB954', iconName: 'spotify' },
    { packageName: 'com.apple.android.music', name: 'Apple Music', enabled: true, color: '#FC3C44', iconName: 'music' },
    { packageName: 'deezer.android.app', name: 'Deezer', enabled: true, color: '#A238FF', iconName: 'disc' },
    { packageName: 'com.google.android.apps.youtube.music', name: 'YouTube Music', enabled: true, color: '#FF0000', iconName: 'youtube' },
    { packageName: 'com.whatsapp', name: 'WhatsApp Audio (Ignoré)', enabled: false, color: '#25D366', iconName: 'message-circle' },
    { packageName: 'org.telegram.messenger', name: 'Telegram Vocal (Ignoré)', enabled: false, color: '#2AABEE', iconName: 'send' }
  ]
};

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'tr-1',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    durationMs: 230000,
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
    genre: 'R&B / Synthpop',
    releaseYear: 2016,
    scrobblesCount: 1420,
    firstScrobbleDate: '2024-01-12',
    lastScrobbleDate: '2026-09-10'
  },
  {
    id: 'tr-2',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    album: 'DAMN.',
    durationMs: 177000,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    genre: 'Hip-Hop',
    releaseYear: 2017,
    scrobblesCount: 1180,
    firstScrobbleDate: '2024-02-04',
    lastScrobbleDate: '2026-09-09'
  },
  {
    id: 'tr-3',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    durationMs: 200000,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    releaseYear: 2020,
    scrobblesCount: 950,
    firstScrobbleDate: '2024-03-10',
    lastScrobbleDate: '2026-09-11'
  },
  {
    id: 'tr-4',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    durationMs: 248000,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    genre: 'Disco / Funk',
    releaseYear: 2013,
    scrobblesCount: 820,
    firstScrobbleDate: '2024-01-15',
    lastScrobbleDate: '2026-09-08'
  },
  {
    id: 'tr-5',
    title: 'Birds in the Trap',
    artist: 'Travis Scott',
    album: 'Birds in the Trap Sing McKnight',
    durationMs: 215000,
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    genre: 'Trap',
    releaseYear: 2016,
    scrobblesCount: 690,
    firstScrobbleDate: '2024-04-01',
    lastScrobbleDate: '2026-09-10'
  },
  {
    id: 'tr-6',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    durationMs: 203000,
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    genre: 'Pop / Dance',
    releaseYear: 2020,
    scrobblesCount: 540,
    firstScrobbleDate: '2024-05-20',
    lastScrobbleDate: '2026-09-07'
  },
  {
    id: 'tr-7',
    title: 'Macarena',
    artist: 'Damso',
    album: 'Ipséité',
    durationMs: 214000,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    genre: 'Rap Français',
    releaseYear: 2017,
    scrobblesCount: 485,
    firstScrobbleDate: '2024-02-18',
    lastScrobbleDate: '2026-09-11'
  },
  {
    id: 'tr-8',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    durationMs: 243000,
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80',
    genre: 'Electro-Dream',
    releaseYear: 2011,
    scrobblesCount: 395,
    firstScrobbleDate: '2024-06-12',
    lastScrobbleDate: '2026-09-06'
  },
  {
    id: 'tr-9',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    album: 'GNX',
    durationMs: 274000,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    genre: 'West Coast Rap',
    releaseYear: 2024,
    scrobblesCount: 710,
    firstScrobbleDate: '2024-05-04',
    lastScrobbleDate: '2026-09-11'
  },
  {
    id: 'tr-10',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    durationMs: 175000,
    coverUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=500&auto=format&fit=crop&q=80',
    genre: 'Nu-Disco Pop',
    releaseYear: 2024,
    scrobblesCount: 310,
    firstScrobbleDate: '2024-07-01',
    lastScrobbleDate: '2026-09-10'
  }
];

export const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-1',
    trackId: 'tr-1',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    level: 'DIAMOND',
    streamsRequired: 1000,
    currentStreams: 1420,
    dateAwarded: '2026-06-15',
    certificateNumber: 'NS-2026-DIA-001',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-2',
    trackId: 'tr-2',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    level: 'DIAMOND',
    streamsRequired: 1000,
    currentStreams: 1180,
    dateAwarded: '2026-07-22',
    certificateNumber: 'NS-2026-DIA-002',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-3',
    trackId: 'tr-3',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    level: 'MULTI_PLATINUM',
    streamsRequired: 800,
    currentStreams: 950,
    dateAwarded: '2026-08-01',
    certificateNumber: 'NS-2026-MPLAT-014',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-4',
    trackId: 'tr-9',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    level: 'PLATINUM',
    streamsRequired: 500,
    currentStreams: 710,
    dateAwarded: '2026-08-14',
    certificateNumber: 'NS-2026-PLAT-033',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-5',
    trackId: 'tr-4',
    title: 'Get Lucky',
    artist: 'Daft Punk',
    level: 'MULTI_PLATINUM',
    streamsRequired: 800,
    currentStreams: 820,
    dateAwarded: '2026-08-20',
    certificateNumber: 'NS-2026-MPLAT-019',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-6',
    trackId: 'tr-5',
    title: 'Birds in the Trap',
    artist: 'Travis Scott',
    level: 'PLATINUM',
    streamsRequired: 500,
    currentStreams: 690,
    dateAwarded: '2026-08-25',
    certificateNumber: 'NS-2026-PLAT-041',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-7',
    trackId: 'tr-6',
    title: 'Levitating',
    artist: 'Dua Lipa',
    level: 'PLATINUM',
    streamsRequired: 500,
    currentStreams: 540,
    dateAwarded: '2026-09-02',
    certificateNumber: 'NS-2026-PLAT-048',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-8',
    trackId: 'tr-7',
    title: 'Macarena',
    artist: 'Damso',
    level: 'GOLD',
    streamsRequired: 250,
    currentStreams: 485,
    dateAwarded: '2026-07-10',
    certificateNumber: 'NS-2026-GOLD-089',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-9',
    trackId: 'tr-8',
    title: 'Midnight City',
    artist: 'M83',
    level: 'GOLD',
    streamsRequired: 250,
    currentStreams: 395,
    dateAwarded: '2026-08-11',
    certificateNumber: 'NS-2026-GOLD-094',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cert-10',
    trackId: 'tr-10',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    level: 'GOLD',
    streamsRequired: 250,
    currentStreams: 310,
    dateAwarded: '2026-09-04',
    certificateNumber: 'NS-2026-GOLD-105',
    coverUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=500&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_PANTHEON: PantheonMember[] = [
  {
    id: 'panth-1',
    artist: 'The Weeknd',
    inductedYear: 2025,
    reason: 'Plus de 2 500 scrobbles cumulés et 14 semaines cumulées en #1 du Billboard Nova.',
    totalScrobbles: 2640,
    numberOneHits: 4,
    topAlbum: 'After Hours',
    avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    badges: ['Pionnier Pop', 'Triple Diamant', 'Hall of Fame 2025']
  },
  {
    id: 'panth-2',
    artist: 'Kendrick Lamar',
    inductedYear: 2025,
    reason: 'Album DAMN. certifié quadruple platine et record du meilleur lancement d\'album en 24 heures.',
    totalScrobbles: 2190,
    numberOneHits: 3,
    topAlbum: 'DAMN.',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    badges: ['Légende Hip-Hop', 'Double Diamant', 'Pulitzer Nova']
  },
  {
    id: 'panth-3',
    artist: 'Daft Punk',
    inductedYear: 2024,
    reason: 'Premier groupe électro intronisé avec une longévité ininterrompue de plus de 10 ans dans la discothèque.',
    totalScrobbles: 1870,
    numberOneHits: 2,
    topAlbum: 'Random Access Memories',
    avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    badges: ['Casques d\'Or', 'Patrimoine Électro']
  }
];

export const INITIAL_RECORDS: RecordItem[] = [
  {
    id: 'rec-1',
    type: 'DAILY_STREAMS_ARTIST',
    title: 'Record de streams Artiste en 24h',
    description: 'Le plus grand nombre de morceaux écoutés d\'un même artiste en une seule journée.',
    holder: 'The Weeknd',
    valueFormatted: '118 scrobbles en 24h',
    dateAchieved: '2026-05-18',
    previousValueFormatted: '92 scrobbles (Kendrick Lamar)',
    isNew: false
  },
  {
    id: 'rec-2',
    type: 'DAILY_STREAMS_TRACK',
    title: 'Morceau le plus streamé en 24h',
    description: 'Plus fort volume de répétition sur une même piste en 24 heures.',
    holder: 'Not Like Us (Kendrick Lamar)',
    valueFormatted: '43 répétitions',
    dateAchieved: '2026-06-02',
    previousValueFormatted: '38 répétitions (HUMBLE.)',
    isNew: false
  },
  {
    id: 'rec-3',
    type: 'LONGEST_STREAK_DAYS',
    title: 'Série d\'écoute consécutive active (Streak)',
    description: 'Nombre ininterrompu de jours avec au moins 10 scrobbles validés.',
    holder: 'Votre profil NovaStat',
    valueFormatted: '142 jours consécutifs',
    dateAchieved: '2026-09-10',
    isNew: true
  },
  {
    id: 'rec-4',
    type: 'TOTAL_HOURS_LISTENED',
    title: 'Volume total d\'heures d\'écoute',
    description: 'Temps réel cumulé en musique depuis l\'installation du moteur NovaStat.',
    holder: 'NovaStat Engine',
    valueFormatted: '348 heures (20 880 min)',
    dateAchieved: '2026-09-11',
    isNew: true
  },
  {
    id: 'rec-5',
    type: 'MOST_BILLBOARD_ENTRIES',
    title: 'Artiste le plus représenté au Billboard',
    description: 'Plus grand nombre de titres simultanés dans le Top 10 du Billboard Nova.',
    holder: 'Kendrick Lamar',
    valueFormatted: '4 titres simultanés',
    dateAchieved: '2026-08-15',
    previousValueFormatted: '3 titres (The Weeknd)'
  }
];

export const INITIAL_AWARDS: Award[] = [
  {
    id: 'awd-1',
    category: 'Artiste de l\'Année 2025',
    period: 'Année 2025',
    winnerName: 'The Weeknd',
    winnerSubtitle: '1 480 scrobbles cumulés',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    metrics: '#1 durant 18 semaines • 3 Disques de Platine',
    trophyType: 'GOLD'
  },
  {
    id: 'awd-2',
    category: 'Album de l\'Année 2025',
    period: 'Année 2025',
    winnerName: 'DAMN.',
    winnerSubtitle: 'Kendrick Lamar',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    metrics: '780 écoutes totales • 100% des pistes certifiées',
    trophyType: 'PLATINUM'
  },
  {
    id: 'awd-3',
    category: 'Titre le plus joué du mois',
    period: 'Août 2026',
    winnerName: 'Not Like Us',
    winnerSubtitle: 'Kendrick Lamar',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    metrics: '148 streams en 31 jours • Pic #1',
    trophyType: 'CRYSTAL'
  }
];

export const INITIAL_HISTORICAL_SNAPSHOTS: BillboardSnapshot[] = [
  {
    weekId: '2026-W35',
    startDate: '2026-08-24',
    endDate: '2026-08-30',
    closedAt: '2026-08-30T23:59:59Z',
    topArtist: 'Kendrick Lamar',
    topTrack: 'Not Like Us',
    totalStreams: 430,
    entries: [
      {
        rank: 1,
        previousRank: 2,
        peakRank: 1,
        weeksOnChart: 16,
        trackId: 'tr-9',
        title: 'Not Like Us',
        artist: 'Kendrick Lamar',
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
        weeklyStreams: 78,
        points: 840,
        trend: 'UP',
        changeAmount: 1
      },
      {
        rank: 2,
        previousRank: 1,
        peakRank: 1,
        weeksOnChart: 24,
        trackId: 'tr-1',
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
        weeklyStreams: 72,
        points: 790,
        trend: 'DOWN',
        changeAmount: -1
      },
      {
        rank: 3,
        previousRank: 4,
        peakRank: 2,
        weeksOnChart: 18,
        trackId: 'tr-2',
        title: 'HUMBLE.',
        artist: 'Kendrick Lamar',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        weeklyStreams: 64,
        points: 680,
        trend: 'UP',
        changeAmount: 1
      }
    ]
  },
  {
    weekId: '2026-W36',
    startDate: '2026-08-31',
    endDate: '2026-09-06',
    closedAt: '2026-09-06T23:59:59Z',
    topArtist: 'The Weeknd',
    topTrack: 'Starboy',
    totalStreams: 510,
    entries: [
      {
        rank: 1,
        previousRank: 2,
        peakRank: 1,
        weeksOnChart: 25,
        trackId: 'tr-1',
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
        weeklyStreams: 88,
        points: 920,
        trend: 'UP',
        changeAmount: 1
      },
      {
        rank: 2,
        previousRank: 1,
        peakRank: 1,
        weeksOnChart: 17,
        trackId: 'tr-9',
        title: 'Not Like Us',
        artist: 'Kendrick Lamar',
        coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
        weeklyStreams: 81,
        points: 860,
        trend: 'DOWN',
        changeAmount: -1
      },
      {
        rank: 3,
        previousRank: 3,
        peakRank: 2,
        weeksOnChart: 19,
        trackId: 'tr-2',
        title: 'HUMBLE.',
        artist: 'Kendrick Lamar',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        weeklyStreams: 70,
        points: 730,
        trend: 'EQUAL',
        changeAmount: 0
      }
    ]
  }
];

export const INITIAL_CURRENT_WEEK_ENTRIES: BillboardEntry[] = [
  {
    rank: 1,
    previousRank: 1,
    peakRank: 1,
    weeksOnChart: 26,
    trackId: 'tr-1',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 96,
    points: 1040,
    trend: 'EQUAL',
    changeAmount: 0
  },
  {
    rank: 2,
    previousRank: 2,
    peakRank: 1,
    weeksOnChart: 18,
    trackId: 'tr-9',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 89,
    points: 970,
    trend: 'EQUAL',
    changeAmount: 0
  },
  {
    rank: 3,
    previousRank: 3,
    peakRank: 2,
    weeksOnChart: 20,
    trackId: 'tr-2',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 76,
    points: 820,
    trend: 'EQUAL',
    changeAmount: 0
  },
  {
    rank: 4,
    previousRank: 6,
    peakRank: 4,
    weeksOnChart: 14,
    trackId: 'tr-3',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 68,
    points: 740,
    trend: 'UP',
    changeAmount: 2
  },
  {
    rank: 5,
    previousRank: 4,
    peakRank: 3,
    weeksOnChart: 22,
    trackId: 'tr-4',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 62,
    points: 660,
    trend: 'DOWN',
    changeAmount: -1
  },
  {
    rank: 6,
    previousRank: 5,
    peakRank: 5,
    weeksOnChart: 11,
    trackId: 'tr-5',
    title: 'Birds in the Trap',
    artist: 'Travis Scott',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 55,
    points: 590,
    trend: 'DOWN',
    changeAmount: -1
  },
  {
    rank: 7,
    previousRank: 9,
    peakRank: 7,
    weeksOnChart: 8,
    trackId: 'tr-7',
    title: 'Macarena',
    artist: 'Damso',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 49,
    points: 510,
    trend: 'UP',
    changeAmount: 2
  },
  {
    rank: 8,
    previousRank: 7,
    peakRank: 6,
    weeksOnChart: 15,
    trackId: 'tr-6',
    title: 'Levitating',
    artist: 'Dua Lipa',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 44,
    points: 470,
    trend: 'DOWN',
    changeAmount: -1
  },
  {
    rank: 9,
    previousRank: null,
    peakRank: 9,
    weeksOnChart: 1,
    trackId: 'tr-10',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    coverUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 42,
    points: 440,
    trend: 'NEW',
    changeAmount: 0
  },
  {
    rank: 10,
    previousRank: 8,
    peakRank: 4,
    weeksOnChart: 19,
    trackId: 'tr-8',
    title: 'Midnight City',
    artist: 'M83',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80',
    weeklyStreams: 38,
    points: 390,
    trend: 'DOWN',
    changeAmount: -2
  }
];

export const INITIAL_SCROBBLES: Scrobble[] = [
  {
    id: 'sc-1',
    trackId: 'tr-1',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    timestamp: Date.now() - 1000 * 60 * 12,
    durationMs: 230000,
    durationListenedMs: 230000,
    playerPackage: 'com.spotify.music',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
    validated: true
  },
  {
    id: 'sc-2',
    trackId: 'tr-9',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    album: 'GNX',
    timestamp: Date.now() - 1000 * 60 * 35,
    durationMs: 274000,
    durationListenedMs: 274000,
    playerPackage: 'com.spotify.music',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    validated: true
  },
  {
    id: 'sc-3',
    trackId: 'tr-2',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    album: 'DAMN.',
    timestamp: Date.now() - 1000 * 60 * 70,
    durationMs: 177000,
    durationListenedMs: 177000,
    playerPackage: 'com.apple.android.music',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    validated: true
  },
  {
    id: 'sc-4',
    trackId: 'tr-7',
    title: 'Macarena',
    artist: 'Damso',
    album: 'Ipséité',
    timestamp: Date.now() - 1000 * 60 * 115,
    durationMs: 214000,
    durationListenedMs: 210000,
    playerPackage: 'deezer.android.app',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    validated: true
  },
  {
    id: 'sc-5',
    trackId: 'tr-3',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    timestamp: Date.now() - 1000 * 60 * 180,
    durationMs: 200000,
    durationListenedMs: 198000,
    playerPackage: 'com.spotify.music',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    validated: true
  }
];
