package com.novastats.app.data

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
}
