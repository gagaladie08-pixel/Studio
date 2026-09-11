import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  Terminal,
  Send,
  Cpu,
  Layers,
  ArrowRightLeft,
  Copy,
  Check
} from 'lucide-react';

export const KotlinStudioView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('NovaBridge');
  const [bridgeLog, setBridgeLog] = useState<Array<{ time: string; direction: 'JS->KT' | 'KT->JS'; message: string }>>([
    { time: '12:00:01', direction: 'KT->JS', message: 'NovaBridge initialized. Android Room connected.' },
    { time: '12:00:02', direction: 'JS->KT', message: 'getBillboardCurrentWeek() requested.' },
    { time: '12:00:03', direction: 'KT->JS', message: 'Dispatched 8 Billboard entries to WebView.' }
  ]);
  const [testPayload, setTestPayload] = useState('{"type":"TEST_SCROBBLE","trackId":"trk-1"}');
  const [copied, setCopied] = useState(false);

  const kotlinFiles: Record<string, { filename: string; path: string; description: string; code: string }> = {
    NovaBridge: {
      filename: 'NovaBridge.kt',
      path: 'app/src/main/java/com/novastats/app/bridge/NovaBridge.kt',
      description: 'Interface JavascriptInterface connectant le WebView React aux DAOs Room et aux Services Android',
      code: `package com.novastats.app.bridge

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
                val durationMs = json.getLong("durationMs")
                val durationListenedMs = json.getLong("durationListenedMs")
                val playerPackage = json.getString("playerPackage")

                val entity = ScrobbleEntity(
                    trackId = trackId,
                    title = title,
                    artist = artist,
                    timestamp = System.currentTimeMillis(),
                    durationMs = durationMs,
                    durationListenedMs = durationListenedMs,
                    playerPackage = playerPackage,
                    validated = true
                )
                db.scrobbleDao().insert(entity)
                
                // Notify front-end back
                notifyWebEvent("ON_SCROBBLE_RECORDED", "{\\"success\\":true,\\"id\\":\${entity.id}}")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @JavascriptInterface
    fun getBillboardSnapshot(weekId: String): String {
        // Returns cached weekly billboard from Room
        val snapshot = db.billboardDao().getByWeekId(weekId)
        return snapshot?.jsonRepresentation ?: "[]"
    }

    fun notifyWebEvent(eventName: String, jsonParams: String) {
        CoroutineScope(Dispatchers.Main).launch {
            webView.evaluateJavascript("window.onNovaEvent('\$eventName', \$jsonParams);", null)
        }
    }
}`
    },
    ScrobbleProcessor: {
      filename: 'ScrobbleProcessor.kt',
      path: 'app/src/main/java/com/novastats/app/service/ScrobbleProcessor.kt',
      description: 'Filtrage temps réel, calcul du 50% ou 30 secondes, et anti-doublon pour les flux audio entrants',
      code: `package com.novastats.app.service

import com.novastats.app.data.NovaDatabase
import com.novastats.app.data.model.TrackEntity

class ScrobbleProcessor(private val db: NovaDatabase) {

    private val MIN_DURATION_SECONDS = 30
    private val MIN_PERCENTAGE = 0.50

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
        durationListenedMs: Long,
        totalDurationMs: Long,
        playerPkg: String
    ) {
        if (!shouldValidateScrobble(durationListenedMs, totalDurationMs)) {
            return // Ignored until minimum duration threshold is reached
        }

        // Increment track counter & verify certifications
        val trackDao = db.trackDao()
        var track = trackDao.getTrackById(trackId)
        if (track == null) {
            track = TrackEntity(
                id = trackId,
                title = title,
                artist = artist,
                scrobblesCount = 1
            )
            trackDao.insert(track)
        } else {
            trackDao.incrementScrobbles(trackId)
        }
    }
}`
    },
    BillboardWorker: {
      filename: 'BillboardWorker.kt',
      path: 'app/src/main/java/com/novastats/app/worker/BillboardWorker.kt',
      description: 'Tâche d\'arrière-plan WorkManager hebdomadaire pour clôturer et archiver le classement Hot 100',
      code: `package com.novastats.app.worker

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
        val weekId = "W\${weekNumber}-\$year"

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
}`
    },
    NotificationListener: {
      filename: 'ScrobbleNotificationListener.kt',
      path: 'app/src/main/java/com/novastats/app/service/ScrobbleNotificationListener.kt',
      description: 'Service NotificationListener captant les métadonnées de Spotify, Apple Music, Deezer et YouTube Music',
      code: `package com.novastats.app.service

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

        if (title != currentPlayingTitle || artist != currentPlayingArtist) {
            finalizePreviousTrack(pkg)
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
        val estimatedTotalMs = 180_000L
        val trackId = "trk-\${title.hashCode().toString(16)}"

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
}`
    },
    NovaDatabase: {
      filename: 'NovaDatabase.kt',
      path: 'app/src/main/java/com/novastats/app/data/NovaDatabase.kt',
      description: 'Définition SQLite Room Database avec singleton thread-safe et migration automatique',
      code: `package com.novastats.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.novastats.app.data.dao.BillboardDao
import com.novastats.app.data.dao.CertificationDao
import com.novastats.app.data.dao.ScrobbleDao
import com.novastats.app.data.dao.TrackDao
import com.novastats.app.data.model.BillboardSnapshotEntity
import com.novastats.app.data.model.CertificationEntity
import com.novastats.app.data.model.ScrobbleEntity
import com.novastats.app.data.model.TrackEntity

@Database(
    entities = [
        ScrobbleEntity::class,
        TrackEntity::class,
        BillboardSnapshotEntity::class,
        CertificationEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class NovaDatabase : RoomDatabase() {

    abstract fun scrobbleDao(): ScrobbleDao
    abstract fun trackDao(): TrackDao
    abstract fun billboardDao(): BillboardDao
    abstract fun certificationDao(): CertificationDao

    companion object {
        @Volatile
        private var INSTANCE: NovaDatabase? = null

        fun getDatabase(context: Context): NovaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NovaDatabase::class.java,
                    "novastat_database.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
    },
    Entities: {
      filename: 'Entities.kt',
      path: 'app/src/main/java/com/novastats/app/data/model/Entities.kt',
      description: 'Entités Room Database (Scrobbles, Morceaux, Snapshots Billboard, Certifications)',
      code: `package com.novastats.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "scrobbles")
data class ScrobbleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val trackId: String,
    val title: String,
    val artist: String,
    val album: String = "",
    val timestamp: Long,
    val durationMs: Long,
    val durationListenedMs: Long,
    val playerPackage: String,
    val validated: Boolean = true
)

@Entity(tableName = "tracks")
data class TrackEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val artist: String,
    val album: String = "",
    val durationMs: Long = 0,
    val coverUrl: String = "",
    val scrobblesCount: Int = 0,
    val firstScrobbleDate: String = "",
    val lastScrobbleDate: String = ""
)

@Entity(tableName = "billboard_snapshots")
data class BillboardSnapshotEntity(
    @PrimaryKey
    val weekId: String,
    val startDate: String,
    val endDate: String,
    val topTrack: String,
    val topArtist: String,
    val totalStreams: Int,
    val jsonRepresentation: String
)

@Entity(tableName = "certifications")
data class CertificationEntity(
    @PrimaryKey
    val id: String,
    val trackId: String,
    val title: String,
    val artist: String,
    val level: String,
    val certificateNumber: String,
    val dateAchieved: String,
    val streamsAtAchieve: Int
)`
    },
    Daos: {
      filename: 'Daos.kt',
      path: 'app/src/main/java/com/novastats/app/data/dao/Daos.kt',
      description: 'Interfaces DAO pour requêtes coroutine SQLite asynchrones',
      code: `package com.novastats.app.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.novastats.app.data.model.BillboardSnapshotEntity
import com.novastats.app.data.model.CertificationEntity
import com.novastats.app.data.model.ScrobbleEntity
import com.novastats.app.data.model.TrackEntity

@Dao
interface ScrobbleDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(scrobble: ScrobbleEntity): Long

    @Query("SELECT * FROM scrobbles ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentScrobbles(limit: Int = 100): List<ScrobbleEntity>

    @Query("SELECT * FROM scrobbles WHERE timestamp >= :sinceTimestamp ORDER BY timestamp DESC")
    suspend fun getScrobblesSince(sinceTimestamp: Long): List<ScrobbleEntity>

    @Query("SELECT COUNT(*) FROM scrobbles")
    suspend fun getTotalCount(): Int
}

@Dao
interface TrackDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(track: TrackEntity)

    @Query("SELECT * FROM tracks WHERE id = :trackId LIMIT 1")
    suspend fun getTrackById(trackId: String): TrackEntity?

    @Query("SELECT * FROM tracks ORDER BY scrobblesCount DESC")
    suspend fun getAllTracksSorted(): List<TrackEntity>

    @Query("UPDATE tracks SET scrobblesCount = scrobblesCount + 1, lastScrobbleDate = :lastDate WHERE id = :trackId")
    suspend fun incrementScrobbles(trackId: String, lastDate: String)
}

@Dao
interface BillboardDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveSnapshot(snapshot: BillboardSnapshotEntity)

    @Query("SELECT * FROM billboard_snapshots WHERE weekId = :weekId LIMIT 1")
    suspend fun getByWeekId(weekId: String): BillboardSnapshotEntity?

    @Query("SELECT * FROM billboard_snapshots ORDER BY weekId DESC")
    suspend fun getAllSnapshots(): List<BillboardSnapshotEntity>
}

@Dao
interface CertificationDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(certification: CertificationEntity)

    @Query("SELECT * FROM certifications WHERE trackId = :trackId")
    suspend fun getByTrackId(trackId: String): List<CertificationEntity>

    @Query("SELECT * FROM certifications ORDER BY dateAchieved DESC")
    suspend fun getAllCertifications(): List<CertificationEntity>
}`
    },
    MainActivity: {
      filename: 'MainActivity.kt',
      path: 'app/src/main/java/com/novastats/app/MainActivity.kt',
      description: 'Activité Android principale configurant le WebView, le pont Javascript et le WorkManager',
      code: `package com.novastats.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.novastats.app.bridge.NovaBridge
import com.novastats.app.worker.BillboardWorker
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var bridge: NovaBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = WebViewClient()

        bridge = NovaBridge(this, webView)
        webView.addJavascriptInterface(bridge, "NovaBridge")

        webView.loadUrl("file:///android_asset/dist/index.html")

        scheduleBillboardWorker()
    }

    private fun scheduleBillboardWorker() {
        val weeklyWorkRequest = PeriodicWorkRequestBuilder<BillboardWorker>(7, TimeUnit.DAYS)
            .build()

        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            "WeeklyBillboardSnapshot",
            ExistingPeriodicWorkPolicy.KEEP,
            weeklyWorkRequest
        )
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`
    },
    AndroidManifest: {
      filename: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      description: 'Manifeste Android avec déclaration des permissions d\'écoute média et des services',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NovaStat"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.ScrobbleNotificationListener"
            android:label="NovaStat Scrobble Listener"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

    </application>

</manifest>`
    },
    Gradle: {
      filename: 'build.gradle.kts',
      path: 'app/build.gradle.kts',
      description: 'Configuration Gradle Kotlin DSL avec Room, WorkManager, Coroutines et WebKit',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("kotlin-kapt")
}

android {
    namespace = "com.novastats.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.novastats.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.webkit:webkit:1.10.0")

    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}`
    }
  };

  const currentFile = kotlinFiles[selectedFile];

  const handleSendSimulatedBridge = () => {
    setBridgeLog((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        direction: 'JS->KT',
        message: testPayload
      },
      {
        time: new Date().toLocaleTimeString(),
        direction: 'KT->JS',
        message: 'NovaBridge: Received & Dispatched to ScrobbleProcessor. Room database updated.'
      }
    ]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="kotlin-studio-view" className="space-y-6 pb-28">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Architecture Hybride Android & Kotlin Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Code Source Android & NovaBridge
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Consultez le code Kotlin natif qui gère la capture d\'écoutes via NotificationListenerService, la base de données Room et la liaison bidirectionnelle avec l\'interface React.
          </p>
        </div>
      </div>

      {/* Architecture overview pill cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Capture Notification</h4>
            <p className="text-[11px] text-slate-400">ScrobbleListenerService.kt (Actif)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Pont Javascript</h4>
            <p className="text-[11px] text-slate-400">NovaBridge.kt (Connecté)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Persistance Room</h4>
            <p className="text-[11px] text-slate-400">NovaDatabase.kt (SQLite)</p>
          </div>
        </div>
      </div>

      {/* Code Viewer & Bridge Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Code Viewer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* File selector tabs */}
          <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 overflow-x-auto py-1 max-w-[82%] no-scrollbar">
              {Object.keys(kotlinFiles).map((fileKey) => (
                <button
                  key={fileKey}
                  onClick={() => setSelectedFile(fileKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedFile === fileKey
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {kotlinFiles[fileKey].filename}
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
          </div>

          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
            📂 {currentFile.path}
          </div>

          <div className="p-4 bg-slate-950 overflow-x-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed">
            <pre>{currentFile.code}</pre>
          </div>
        </div>

        {/* Right: Live Interactive Bridge Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Console Émulateur NovaBridge</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Testez l\'envoi d\'événements JSON entre la WebView React et l\'interface Android native.
            </p>

            {/* Bridge Log */}
            <div className="mt-4 bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] h-64 overflow-y-auto space-y-2">
              {bridgeLog.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-slate-500">[{log.time}] </span>
                  <span
                    className={log.direction === 'JS->KT' ? 'text-indigo-400 font-bold' : 'text-emerald-400 font-bold'}
                  >
                    {log.direction}{' '}
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test input */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Payload JSON à injecter dans NovaBridge
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendSimulatedBridge}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                title="Envoyer au Bridge"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
