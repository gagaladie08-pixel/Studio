package com.novastats.app.service

import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.novastats.app.data.NovaDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ScrobbleNotificationListener : NotificationListenerService() {

    private val supportedPackages = setOf(
        "com.spotify.music",
        "com.apple.android.music",
        "deezer.android.app",
        "com.google.android.apps.youtube.music"
    )

    private val scope = CoroutineScope(Dispatchers.IO)
    private lateinit var processor: ScrobbleProcessor

    private var currentPlayingTitle: String? = null
    private var currentPlayingArtist: String? = null
    private var playStartTime: Long = 0L

    override fun onCreate() {
        super.onCreate()
        val db = NovaDatabase.getDatabase(applicationContext)
        processor = ScrobbleProcessor(db)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        val pkg = sbn?.packageName ?: return
        if (!supportedPackages.contains(pkg)) return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: return
        val artist = extras.getCharSequence("android.text")?.toString() ?: "Artiste inconnu"
        val album = extras.getCharSequence("android.subText")?.toString() ?: ""

        // Detect track transition
        if (title != currentPlayingTitle || artist != currentPlayingArtist) {
            // Process previous track if listened long enough
            finalizePreviousTrack(pkg)

            // Start tracking new track
            currentPlayingTitle = title
            currentPlayingArtist = artist
            playStartTime = System.currentTimeMillis()
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
        val pkg = sbn?.packageName ?: return
        if (supportedPackages.contains(pkg)) {
            finalizePreviousTrack(pkg)
            currentPlayingTitle = null
            currentPlayingArtist = null
        }
    }

    private fun finalizePreviousTrack(pkg: String) {
        val title = currentPlayingTitle ?: return
        val artist = currentPlayingArtist ?: return
        if (playStartTime == 0L) return

        val listenedMs = System.currentTimeMillis() - playStartTime
        val estimatedTotalMs = 180_000L // default fallback 3 mins if duration unknown
        val trackId = "trk-${title.hashCode().toString(16)}"

        scope.launch {
            processor.processIncomingPlayback(
                trackId = trackId,
                title = title,
                artist = artist,
                durationListenedMs = listenedMs,
                totalDurationMs = estimatedTotalMs,
                playerPkg = pkg
            )
        }
        playStartTime = 0L
    }
}
