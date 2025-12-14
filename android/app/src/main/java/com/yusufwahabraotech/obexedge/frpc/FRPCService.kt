package com.yusufwahabraotech.obexedge.frpc

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.yusufwahabraotech.obexedge.R

class FRPCService : Service() {
    
    companion object {
        private const val TAG = "FRPCService"
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "FRPC_SERVICE_CHANNEL"
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "FRPCService created")
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "FRPCService started")
        
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "FRPCService destroyed")
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "FRPC Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "FRPC tunnel service"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("FRPC Tunnel Active")
            .setContentText("Camera tunneling service is running")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }
}