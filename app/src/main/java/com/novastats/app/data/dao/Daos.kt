package com.novastats.app.data.dao

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
}
