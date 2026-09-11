package com.novastats.app.bridge

import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.novastats.app.data.NovaDatabase
import com.novastats.app.data.model.ScrobbleEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

class NovaBridge(
    private val context: Context,
    private val webView: WebView
) {
    private val db = NovaDatabase.getDatabase(context)
    private val scope = CoroutineScope(Dispatchers.IO)

    @JavascriptInterface
    fun postScrobble(jsonPayload: String) {
        scope.launch {
            try {
                val json = JSONObject(jsonPayload)
                val trackId = json.getString("trackId")
                val title = json.getString("title")
                val artist = json.getString("artist")
                val album = json.optString("album", "")
                val durationMs = json.getLong("durationMs")
                val durationListenedMs = json.getLong("durationListenedMs")
                val playerPackage = json.getString("playerPackage")

                val entity = ScrobbleEntity(
                    trackId = trackId,
                    title = title,
                    artist = artist,
                    album = album,
                    timestamp = System.currentTimeMillis(),
                    durationMs = durationMs,
                    durationListenedMs = durationListenedMs,
                    playerPackage = playerPackage,
                    validated = true
                )
                val newId = db.scrobbleDao().insert(entity)

                // Increment track scrobbles in Room
                val todayStr = java.time.LocalDate.now().toString()
                db.trackDao().incrementScrobbles(trackId, todayStr)

                // Dispatch notification back to web view
                notifyWebEvent("ON_SCROBBLE_RECORDED", "{\"success\":true,\"id\":$newId,\"trackId\":\"$trackId\"}")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @JavascriptInterface
    fun getBillboardSnapshot(weekId: String): String {
        return try {
            val snapshot = kotlinx.coroutines.runBlocking(Dispatchers.IO) {
                db.billboardDao().getByWeekId(weekId)
            }
            snapshot?.jsonRepresentation ?: "[]"
        } catch (e: Exception) {
            "[]"
        }
    }

    @JavascriptInterface
    fun getRecentScrobbles(limit: Int): String {
        return try {
            val scrobbles = kotlinx.coroutines.runBlocking(Dispatchers.IO) {
                db.scrobbleDao().getRecentScrobbles(limit)
            }
            val array = org.json.JSONArray()
            scrobbles.forEach {
                val obj = JSONObject()
                obj.put("id", it.id)
                obj.put("trackId", it.trackId)
                obj.put("title", it.title)
                obj.put("artist", it.artist)
                obj.put("timestamp", it.timestamp)
                obj.put("playerPackage", it.playerPackage)
                array.put(obj)
            }
            array.toString()
        } catch (e: Exception) {
            "[]"
        }
    }

    fun notifyWebEvent(eventName: String, jsonParams: String) {
        CoroutineScope(Dispatchers.Main).launch {
            webView.evaluateJavascript("window.onNovaEvent('$eventName', $jsonParams);", null)
        }
    }
}
