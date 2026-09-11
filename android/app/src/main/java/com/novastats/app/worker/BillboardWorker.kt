package com.novastats.app.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.novastats.app.data.NovaDatabase
import com.novastats.app.data.model.BillboardSnapshotEntity
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.util.Calendar

class BillboardWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val db = NovaDatabase.getDatabase(applicationContext)
        val calendar = Calendar.getInstance()
        val weekNumber = calendar.get(Calendar.WEEK_OF_YEAR)
        val year = calendar.get(Calendar.YEAR)
        val weekId = "W${weekNumber}-$year"

        val sevenDaysAgo = System.currentTimeMillis() - (7L * 24 * 60 * 60 * 1000)

        // 1. Gather all validated scrobbles for the past 7 days
        val scrobbles = db.scrobbleDao().getScrobblesSince(sevenDaysAgo)
        if (scrobbles.isEmpty()) {
            return Result.success()
        }

        // 2. Calculate Billboard points: Streams * 10 + Repeat bonus
        val rankings = scrobbles
            .groupBy { it.trackId }
            .map { (trackId, list) ->
                val sample = list.first()
                val count = list.size
                val points = (count * 10) + (Math.pow(count.toDouble(), 1.15) * 1.5).toInt()
                Triple(trackId, sample, points)
            }
            .sortedByDescending { it.third }

        val topEntry = rankings.firstOrNull()
        val topTrack = topEntry?.second?.title ?: "N/A"
        val topArtist = topEntry?.second?.artist ?: "N/A"
        val totalStreams = scrobbles.size

        // 3. Build JSON representation for WebView
        val jsonArray = JSONArray()
        rankings.take(100).forEachIndexed { index, (trackId, sample, points) ->
            val obj = JSONObject()
            obj.put("rank", index + 1)
            obj.put("trackId", trackId)
            obj.put("title", sample.title)
            obj.put("artist", sample.artist)
            obj.put("points", points)
            obj.put("weeklyStreams", scrobbles.count { it.trackId == trackId })
            jsonArray.put(obj)
        }

        val today = LocalDate.now().toString()
        val sevenDaysAgoDate = LocalDate.now().minusDays(7).toString()

        val snapshot = BillboardSnapshotEntity(
            weekId = weekId,
            startDate = sevenDaysAgoDate,
            endDate = today,
            topTrack = topTrack,
            topArtist = topArtist,
            totalStreams = totalStreams,
            jsonRepresentation = jsonArray.toString()
        )

        // 4. Save snapshot in Room
        db.billboardDao().saveSnapshot(snapshot)

        return Result.success()
    }
}
