package com.yusufwahabraotech.obexedge.frpc

import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkInfo
import android.net.wifi.WifiManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.*
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class FRPCModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val context = reactContext
    private var frpcProcess: Process? = null
    private val executor = Executors.newCachedThreadPool()
    
    companion object {
        private const val TAG = "FRPCModule"
        private const val FRPC_BINARY_NAME = "frpc"
    }
    
    init {
        Log.d(TAG, "FRPCModule initialized")
    }
    
    override fun getName(): String {
        Log.d(TAG, "getName() called, returning: FRPCModule")
        return "FRPCModule"
    }
    
    @ReactMethod
    fun installFRPCBinary(promise: Promise) {
        try {
            val assetManager = context.assets
            val binaryName = if (Build.CPU_ABI.contains("arm64") || Build.CPU_ABI2.contains("arm64")) {
                "frpc"
            } else {
                "frpc"
            }
            
            val inputStream = assetManager.open("frpc_arm64/$binaryName")
            val filesDir = context.filesDir
            val frpcFile = File(filesDir, FRPC_BINARY_NAME)
            
            val outputStream = FileOutputStream(frpcFile)
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.close()
            
            // Make executable using multiple methods for reliability
            frpcFile.setExecutable(true, false)
            frpcFile.setReadable(true, false)
            frpcFile.setWritable(true, true)
            
            // Also try using chmod command
            try {
                Runtime.getRuntime().exec("chmod 755 ${frpcFile.absolutePath}").waitFor()
            } catch (e: Exception) {
                Log.w(TAG, "chmod command failed, relying on setExecutable: ${e.message}")
            }
            
            Log.d(TAG, "FRPC binary installed at: ${frpcFile.absolutePath}")
            promise.resolve(frpcFile.absolutePath)
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to install FRPC binary", e)
            promise.reject("INSTALL_ERROR", "Failed to install FRPC binary: ${e.message}")
        }
    }
    
    @ReactMethod
    fun generateConfig(cameras: ReadableArray, serverAddr: String, serverPort: Int, token: String, promise: Promise) {
        try {
            val configBuilder = StringBuilder()
            
            // Common section
            configBuilder.append("[common]\n")
            configBuilder.append("server_addr = $serverAddr\n")
            configBuilder.append("server_port = $serverPort\n")
            configBuilder.append("token = $token\n\n")
            
            // Camera sections
            for (i in 0 until cameras.size()) {
                val camera = cameras.getMap(i)
                val id = camera?.getString("id") ?: "camera_$i"
                val localIP = camera?.getString("localIP") ?: ""
                val localPort = camera?.getInt("localPort") ?: 554
                val remotePort = camera?.getInt("remotePort") ?: (500 + i)
                
                configBuilder.append("[$id]\n")
                configBuilder.append("type = tcp\n")
                configBuilder.append("local_ip = $localIP\n")
                configBuilder.append("local_port = $localPort\n")
                configBuilder.append("remote_port = $remotePort\n\n")
            }
            
            // Save config file
            val configFile = File(context.filesDir, "frpc.ini")
            configFile.writeText(configBuilder.toString())
            
            Log.d(TAG, "Config generated: ${configFile.absolutePath}")
            promise.resolve(configFile.absolutePath)
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate config", e)
            promise.reject("CONFIG_ERROR", "Failed to generate config: ${e.message}")
        }
    }
    
    @ReactMethod
    fun startFRPC(configPath: String, promise: Promise) {
        try {
            if (frpcProcess != null && frpcProcess!!.isAlive) {
                promise.reject("ALREADY_RUNNING", "FRPC is already running")
                return
            }
            
            val frpcBinary = File(context.filesDir, FRPC_BINARY_NAME)
            if (!frpcBinary.exists()) {
                promise.reject("BINARY_NOT_FOUND", "FRPC binary not found")
                return
            }
            
            val processBuilder = ProcessBuilder(
                frpcBinary.absolutePath,
                "-c",
                configPath
            )
            
            processBuilder.directory(context.filesDir)
            processBuilder.redirectErrorStream(true)
            
            frpcProcess = processBuilder.start()
            
            // Monitor process output
            executor.submit {
                monitorProcess()
            }
            
            Log.d(TAG, "FRPC started successfully")
            promise.resolve("FRPC started successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start FRPC", e)
            promise.reject("START_ERROR", "Failed to start FRPC: ${e.message}")
        }
    }
    
    @ReactMethod
    fun stopFRPC(promise: Promise) {
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
                    
                    Log.d(TAG, "FRPC stopped")
                    promise.resolve("FRPC stopped successfully")
                } else {
                    promise.resolve("FRPC was not running")
                }
            } ?: promise.resolve("FRPC was not running")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop FRPC", e)
            promise.reject("STOP_ERROR", "Failed to stop FRPC: ${e.message}")
        }
    }
    
    @ReactMethod
    fun isFRPCRunning(promise: Promise) {
        val isRunning = frpcProcess?.isAlive ?: false
        promise.resolve(isRunning)
    }
    
    @ReactMethod
    fun startForegroundService(promise: Promise) {
        try {
            val intent = Intent(context, FRPCService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            promise.resolve("Foreground service started")
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Failed to start service: ${e.message}")
        }
    }
    
    @ReactMethod
    fun stopForegroundService(promise: Promise) {
        try {
            val intent = Intent(context, FRPCService::class.java)
            context.stopService(intent)
            promise.resolve("Foreground service stopped")
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Failed to stop service: ${e.message}")
        }
    }
    
    @ReactMethod
    fun scanNetwork(promise: Promise) {
        executor.submit {
            try {
                val cameras = scanForCameras()
                val result = Arguments.createArray()
                
                cameras.forEach { camera ->
                    val cameraMap = Arguments.createMap()
                    cameraMap.putString("ip", camera.first)
                    cameraMap.putInt("port", camera.second)
                    result.pushMap(cameraMap)
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("SCAN_ERROR", "Network scan failed: ${e.message}")
            }
        }
    }
    
    private fun monitorProcess() {
        try {
            frpcProcess?.let { process ->
                val reader = BufferedReader(InputStreamReader(process.inputStream))
                var line: String?
                
                while (reader.readLine().also { line = it } != null && process.isAlive) {
                    Log.d(TAG, "FRPC: $line")
                    
                    // Send logs to React Native
                    val params = Arguments.createMap()
                    params.putString("log", line)
                    sendEvent("FRPCLog", params)
                }
                
                val exitCode = process.waitFor()
                Log.d(TAG, "FRPC process exited with code: $exitCode")
                
                val params = Arguments.createMap()
                params.putInt("exitCode", exitCode)
                sendEvent("FRPCExit", params)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error monitoring FRPC process", e)
        }
    }
    
    private fun scanForCameras(): List<Pair<String, Int>> {
        val cameras = mutableListOf<Pair<String, Int>>()
        val networkPrefix = getNetworkPrefix() ?: return cameras
        val ports = listOf(554, 8554, 8080)
        
        for (i in 1..254) {
            val ip = "$networkPrefix.$i"
            for (port in ports) {
                if (isPortOpen(ip, port, 500)) {
                    cameras.add(Pair(ip, port))
                    break // Found camera on this IP, no need to check other ports
                }
            }
        }
        
        return cameras
    }
    
    private fun getNetworkPrefix(): String? {
        try {
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val wifiInfo = wifiManager.connectionInfo
            val ipAddress = wifiInfo.ipAddress
            
            val ip = String.format(
                "%d.%d.%d",
                ipAddress and 0xff,
                ipAddress shr 8 and 0xff,
                ipAddress shr 16 and 0xff
            )
            
            return ip
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get network prefix", e)
            return null
        }
    }
    
    private fun isPortOpen(ip: String, port: Int, timeout: Int): Boolean {
        return try {
            Socket().use { socket ->
                socket.connect(InetSocketAddress(ip, port), timeout)
                true
            }
        } catch (e: Exception) {
            false
        }
    }
    
    private fun sendEvent(eventName: String, params: WritableMap?) {
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}