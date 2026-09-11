package com.novastats.app.service

import com.novastats.app.data.NovaDatabase
import com.novastats.app.data.model.CertificationEntity
import com.novastats.app.data.model.ScrobbleEntity
import com.novastats.app.data.model.TrackEntity

class ScrobbleProcessor(private val db: NovaDatabase) {

    companion object {
        const val MIN_DURATION_SECONDS = 30
        const val MIN_PERCENTAGE = 0.50

        val CERTIFICATION_THRESHOLDS = mapOf(
            100 to "SILVER",
            250 to "GOLD",
            500 to "PLATINUM",
            800 to "MULTI_PLATINUM",
            1000 to "DIAMOND"
        )
    }

    fun shouldValidateScrobble(
        durationListenedMs: Long,
        totalDurationMs: Long
    ): Boolean {
        val seconds = durationListenedMs / 1000
        val ratio = durationListenedMs.toDouble() / Math.max(1L, totalDurationMs)
        return seconds >= MIN_DURATION_SECONDS || ratio >= MIN_PERCENTAGE
    }

    suspend fun processIncomingPlayback(
        trackId: String,
        title: String,
        artist: String,
        album: String = "",
        durationListenedMs: Long,
        totalDurationMs: Long,
        playerPkg: String
    ): Boolean {
        if (!shouldValidateScrobble(durationListenedMs, totalDurationMs)) {
            return false // Ignored until minimum duration threshold is reached
        }

        val trackDao = db.trackDao()
        val scrobbleDao = db.scrobbleDao()
        val todayStr = java.time.LocalDate.now().toString()

        // 1. Insert verified scrobble
        val scrobble = ScrobbleEntity(
            trackId = trackId,
            title = title,
            artist = artist,
            album = album,
            timestamp = System.currentTimeMillis(),
            durationMs = totalDurationMs,
            durationListenedMs = durationListenedMs,
            playerPackage = playerPkg,
            validated = true
        )
        scrobbleDao.insert(scrobble)

        // 2. Update track statistics
        val existingTrack = trackDao.getTrackById(trackId)
        val newCount = if (existingTrack == null) {
            val newTrack = TrackEntity(
                id = trackId,
                title = title,
                artist = artist,
                album = album,
                durationMs = totalDurationMs,
                scrobblesCount = 1,
                firstScrobbleDate = todayStr,
                lastScrobbleDate = todayStr
            )
            trackDao.insert(newTrack)
            1
        } else {
            trackDao.incrementScrobbles(trackId, todayStr)
            existingTrack.scrobblesCount + 1
        }

        // 3. Evaluate any unlocked certifications
        checkAndAwardCertification(trackId, title, artist, newCount, todayStr)

        return true
    }

    private suspend fun checkAndAwardCertification(
        trackId: String,
        title: String,
        artist: String,
        scrobblesCount: Int,
        todayStr: String
    ) {
        val existingCerts = db.certificationDao().getByTrackId(trackId).map { it.level }

        CERTIFICATION_THRESHOLDS.forEach { (threshold, level) ->
            if (scrobblesCount >= threshold && !existingCerts.contains(level)) {
                val certNum = "NV-${(1000..9999).random()}-${trackId.takeLast(4).uppercase()}"
                val cert = CertificationEntity(
                    id = "cert-${System.currentTimeMillis()}-$level",
                    trackId = trackId,
                    title = title,
                    artist = artist,
                    level = level,
                    certificateNumber = certNum,
                    dateAchieved = todayStr,
                    streamsAtAchieve = scrobblesCount
                )
                db.certificationDao().insert(cert)
            }
        }
    }
}
