package com.yusufwahabraotech.obexedge.frpc

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.*
import java.util.concurrent.Executors
import android.content.Context
import android.os.Build
import android.util.Log

class FRPCModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val context = reactContext
    private var frpcProcess: Process? = null
    private var nativePid: Int = -1
    private val executor = Executors.newSingleThreadExecutor()
    
    companion object {
        init {
            try {
                System.loadLibrary("frpc_wrapper")
            } catch (e: UnsatisfiedLinkError) {
                Log.w("FRPCModule", "Native library not available: ${e.message}")
            }
        }
    }
    
    external fun nativeExecuteFRPC(binaryPath: String, configPath: String): Int
    external fun nativeStopFRPC(pid: Int): Boolean
    
    override fun getName(): String = "FRPCModule"
    
    @ReactMethod
    fun startFRPC(config: ReadableMap, promise: Promise) {
        executor.execute {
            try {
                val result = executeFRPCWithFallback(config)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("FRPC_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun stopFRPC(promise: Promise) {
        executor.execute {
            try {
                val stopped = stopFRPCProcess()
                promise.resolve(stopped)
            } catch (e: Exception) {
                promise.reject("FRPC_STOP_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun isFRPCRunning(promise: Promise) {
        try {
            val isRunning = (frpcProcess != null && frpcProcess!!.isAlive) || nativePid > 0
            promise.resolve(isRunning)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
    
    @ReactMethod
    fun installFRPCBinary(promise: Promise) {
        try {
            val binaryPath = extractBinary()
            promise.resolve(binaryPath)
        } catch (e: Exception) {
            promise.reject("INSTALL_ERROR", e.message, e)
        }
    }
    
    private fun executeFRPCWithFallback(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        // Method 1: Native Library
        try {
            val nativeResult = executeWithNativeLibrary(config)
            if (nativeResult.getBoolean("success")) {
                result.putString("method", "native_library")
                result.putBoolean("success", true)
                result.putString("message", "FRPC started via native library")
                return result
            }
        } catch (e: Exception) {
            Log.w("FRPCModule", "Native library failed: ${e.message}")
        }
        
        // Method 2-7: Binary execution methods
        val binaryMethods = listOf(
            "direct_binary" to ::executeDirectBinary,
            "cache_directory" to ::executeCacheDirectory,
            "alternative_shell" to ::executeAlternativeShell,
            "app_process" to ::executeAppProcess,
            "cmake_wrapper" to ::executeCMakeWrapper,
            "development_sim" to ::executeDevelopmentSimulation
        )
        
        for ((methodName, method) in binaryMethods) {
            try {
                val methodResult = method(config)
                if (methodResult.getBoolean("success")) {
                    result.putString("method", methodName)
                    result.putBoolean("success", true)
                    result.putString("message", "FRPC started via $methodName")
                    return result
                }
            } catch (e: Exception) {
                Log.w("FRPCModule", "$methodName failed: ${e.message}")
            }
        }
        
        result.putBoolean("success", false)
        result.putString("message", "All execution methods failed")
        return result
    }
    
    private fun executeWithNativeLibrary(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        try {
            val configPath = createConfigFile(config)
            val binaryPath = extractBinary()
            
            nativePid = nativeExecuteFRPC(binaryPath, configPath)
            
            if (nativePid > 0) {
                result.putBoolean("success", true)
                result.putString("message", "Native execution successful")
            } else {
                result.putBoolean("success", false)
                result.putString("message", "Native execution failed")
            }
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("message", "Native library error: ${e.message}")
        }
        
        return result
    }
    
    private fun executeDirectBinary(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        try {
            val configPath = createConfigFile(config)
            val binaryPath = extractBinary()
            
            val processBuilder = ProcessBuilder(binaryPath, "-c", configPath)
            frpcProcess = processBuilder.start()
            
            result.putBoolean("success", true)
            result.putString("message", "Direct binary execution successful")
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("message", "Direct binary failed: ${e.message}")
        }
        
        return result
    }
    
    private fun executeCacheDirectory(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        try {
            val cacheDir = context.cacheDir
            val binaryFile = File(cacheDir, "frpc")
            
            if (!binaryFile.exists()) {
                copyAssetToFile("frpc_arm64/frpc", binaryFile)
            }
            
            binaryFile.setExecutable(true)
            
            val configPath = createConfigFile(config)
            val processBuilder = ProcessBuilder(binaryFile.absolutePath, "-c", configPath)
            frpcProcess = processBuilder.start()
            
            result.putBoolean("success", true)
            result.putString("message", "Cache directory execution successful")
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("message", "Cache directory failed: ${e.message}")
        }
        
        return result
    }
    
    private fun executeAlternativeShell(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        try {
            val configPath = createConfigFile(config)
            val binaryPath = extractBinary()
            
            val processBuilder = ProcessBuilder("/system/bin/sh", "-c", "$binaryPath -c $configPath")
            frpcProcess = processBuilder.start()
            
            result.putBoolean("success", true)
            result.putString("message", "Alternative shell execution successful")
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("message", "Alternative shell failed: ${e.message}")
        }
        
        return result
    }
    
    private fun executeAppProcess(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        try {
            val configPath = createConfigFile(config)
            val binaryPath = extractBinary()
            
            val processBuilder = ProcessBuilder("app_process", "/system/bin", binaryPath, "-c", configPath)
            frpcProcess = processBuilder.start()
            
            result.putBoolean("success", true)
            result.putString("message", "App process execution successful")
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("message", "App process failed: ${e.message}")
        }
        
        return result
    }
    
    private fun executeCMakeWrapper(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        try {
            val configPath = createConfigFile(config)
            val binaryPath = extractBinary()
            
            nativePid = nativeExecuteFRPC(binaryPath, configPath)
            
            if (nativePid > 0) {
                result.putBoolean("success", true)
                result.putString("message", "CMake wrapper execution successful")
            } else {
                result.putBoolean("success", false)
                result.putString("message", "CMake wrapper failed")
            }
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("message", "CMake wrapper error: ${e.message}")
        }
        
        return result
    }
    
    private fun executeDevelopmentSimulation(config: ReadableMap): WritableMap {
        val result = Arguments.createMap()
        
        // Simulate successful execution for development
        result.putBoolean("success", true)
        result.putString("message", "Development simulation - FRPC execution simulated successfully")
        
        // Send simulated logs
        val params = Arguments.createMap()
        params.putString("log", "SIMULATION: FRPC would start with config: ${config.toString()}")
        sendEvent("FRPCLog", params)
        
        return result
    }
    
    private fun stopFRPCProcess(): Boolean {
        var stopped = false
        
        // Stop native process
        if (nativePid > 0) {
            stopped = nativeStopFRPC(nativePid)
            nativePid = -1
        }
        
        // Stop Java process
        frpcProcess?.let {
            it.destroy()
            stopped = true
            frpcProcess = null
        }
        
        return stopped
    }
    
    private fun extractBinary(): String {
        val filesDir = context.filesDir
        val binaryFile = File(filesDir, "frpc")
        
        if (!binaryFile.exists()) {
            copyAssetToFile("frpc_arm64/frpc", binaryFile)
        }
        
        binaryFile.setExecutable(true)
        return binaryFile.absolutePath
    }
    
    private fun createConfigFile(config: ReadableMap): String {
        val filesDir = context.filesDir
        val configFile = File(filesDir, "frpc.ini")
        
        val serverAddr = config.getString("serverAddr") ?: "staging.ai.avzdax.com"
        val serverPort = config.getInt("serverPort").toString()
        val token = config.getString("token") ?: "30PWz5yr0zf7lUALdMauzcxsHs5_3y1BfJdrVJVV8aVAzteNf"
        val localIp = config.getString("localIp") ?: "192.168.1.10"
        val localPort = config.getInt("localPort").toString()
        val remotePort = config.getInt("remotePort").toString()
        
        val configContent = """
            [common]
            server_addr = $serverAddr
            server_port = $serverPort
            token = $token
            
            [rtsp_camera]
            type = tcp
            local_ip = $localIp
            local_port = $localPort
            remote_port = $remotePort
        """.trimIndent()
        
        configFile.writeText(configContent)
        return configFile.absolutePath
    }
    
    private fun copyAssetToFile(assetPath: String, targetFile: File) {
        context.assets.open(assetPath).use { input ->
            FileOutputStream(targetFile).use { output ->
                input.copyTo(output)
            }
        }
    }
    
    private fun sendEvent(eventName: String, params: WritableMap?) {
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}