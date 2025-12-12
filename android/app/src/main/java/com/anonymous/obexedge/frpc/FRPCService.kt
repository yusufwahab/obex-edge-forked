package com.anonymous.obexedge.frpc

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.*
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class FRPCService : Service() {
    
    private var frpcProcess: Process? = null
    private val executor = Executors.newCachedThreadPool()
    private var isServiceRunning = false
    
    companion object {
        private const val TAG = "FRPCService"
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "FRPC_SERVICE_CHANNEL"
        private const val FRPC_BINARY_NAME = "frpc"
    }
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "FRPCService created")
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "FRPCService started")
        
        startForeground(NOTIFICATION_ID, createNotification())
        isServiceRunning = true
        
        // Start FRPC process
        startFRPCProcess()
        
        return START_STICKY // Restart service if killed by system
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "FRPCService destroyed")
        
        isServiceRunning = false
        stopFRPCProcess()
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Camera Tunnel Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps camera tunnels active in background"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Camera Tunnel Active")
            .setContentText("Your cameras are accessible remotely")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }
    
    private fun startFRPCProcess() {
        executor.submit {
            try {
                val configFile = File(filesDir, "frpc.ini")
                if (!configFile.exists()) {
                    Log.e(TAG, "Config file not found: ${configFile.absolutePath}")
                    return@submit
                }
                
                val frpcBinary = File(filesDir, FRPC_BINARY_NAME)
                if (!frpcBinary.exists()) {
                    Log.e(TAG, "FRPC binary not found: ${frpcBinary.absolutePath}")
                    return@submit
                }
                
                val processBuilder = ProcessBuilder(
                    frpcBinary.absolutePath,
                    "-c",
                    configFile.absolutePath
                )
                
                processBuilder.directory(filesDir)
                processBuilder.redirectErrorStream(true)
                
                frpcProcess = processBuilder.start()
                Log.d(TAG, "FRPC process started successfully")
                
                // Monitor process
                monitorProcess()
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start FRPC process", e)
            }
        }
    }
    
    private fun stopFRPCProcess() {
        try {
            frpcProcess?.let { process ->
                if (process.isAlive) {
                    process.destroy()
                    
                    // Force kill if not stopped within 5 seconds
                    executor.submit {
                        try {
                            if (!process.waitFor(5, TimeUnit.SECONDS)) {
                                process.destroyForcibly()
                            }
                        } catch (e: InterruptedException) {
                            process.destroyForcibly()
                        }
                    }
                    
                    Log.d(TAG, "FRPC process stopped")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping FRPC process", e)
        }
    }
    
    private fun monitorProcess() {
        try {
            frpcProcess?.let { process ->
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                var line: String?
                
                while (reader.readLine().also { line = it } != null && process.isAlive) {
                    Log.d(TAG, "FRPC: $line")
                }
                
                val exitCode = process.waitFor()
                Log.d(TAG, "FRPC process exited with code: $exitCode")
                
                // Auto-restart if service is still running and process crashed
                if (isServiceRunning && exitCode != 0) {
                    Log.d(TAG, "Restarting FRPC process in 5 seconds...")
                    Thread.sleep(5000)
                    if (isServiceRunning) {
                        startFRPCProcess()
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error monitoring FRPC process", e)
            
            // Restart on error if service is still running
            if (isServiceRunning) {
                Thread.sleep(5000)
                startFRPCProcess()
            }
        }
    }
}