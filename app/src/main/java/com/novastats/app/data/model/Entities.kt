package com.novastats.app.data.model

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
)
