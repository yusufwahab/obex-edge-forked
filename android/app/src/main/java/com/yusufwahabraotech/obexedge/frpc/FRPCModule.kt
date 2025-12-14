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
    private var useNativeLibrary = false
    
    companion object {
        private const val TAG = "FRPCModule"
        private const val FRPC_BINARY_NAME = "frpc"
        
        // Load native library if available
        init {
            try {
                System.loadLibrary("frpc")
                Log.d(TAG, "Native FRPC library loaded successfully")
            } catch (e: UnsatisfiedLinkError) {
                Log.w(TAG, "Native FRPC library not available, will use binary fallback")
            }
        }
        
        // Native method declarations
        external fun nativeStartFRPC(configPath: String): Int
        external fun nativeStopFRPC(): Int
        external fun nativeIsRunning(): Boolean
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
            // Determine correct binary based on device architecture
            val (assetFolder, binaryName) = when {
                Build.CPU_ABI.contains("arm64") || Build.CPU_ABI2.contains("arm64") -> {
                    Pair("frpc_arm64", "frpc")
                }
                Build.CPU_ABI.contains("armeabi") || Build.CPU_ABI2.contains("armeabi") -> {
                    Pair("frpc_arm32", "frpc")
                }
                Build.CPU_ABI.contains("x86_64") || Build.CPU_ABI2.contains("x86_64") -> {
                    Pair("frpc_x86_64", "frpc")
                }
                else -> {
                    Log.w(TAG, "Unknown architecture: ${Build.CPU_ABI}, trying ARM64")
                    Pair("frpc_arm64", "frpc")
                }
            }
            
            Log.d(TAG, "Device architecture: ${Build.CPU_ABI}, using: $assetFolder/$binaryName")
            
            val inputStream = try {
                assetManager.open("$assetFolder/$binaryName")
            } catch (e: Exception) {
                Log.w(TAG, "Binary not found for $assetFolder, falling back to ARM64")
                assetManager.open("frpc_arm64/frpc")
            }
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
            
            // Try multiple chmod approaches for Android compatibility
            try {
                // Method 1: Direct chmod command
                val chmodProcess = Runtime.getRuntime().exec(arrayOf("chmod", "755", frpcFile.absolutePath))
                chmodProcess.waitFor()
                Log.d(TAG, "chmod 755 completed with exit code: ${chmodProcess.exitValue()}")
            } catch (e: Exception) {
                Log.w(TAG, "chmod 755 failed: ${e.message}")
                
                // Method 2: Try su chmod (if device is rooted)
                try {
                    val suProcess = Runtime.getRuntime().exec(arrayOf("su", "-c", "chmod 755 ${frpcFile.absolutePath}"))
                    suProcess.waitFor()
                    Log.d(TAG, "su chmod completed")
                } catch (e2: Exception) {
                    Log.w(TAG, "su chmod also failed: ${e2.message}")
                }
            }
            
            // Verify permissions
            Log.d(TAG, "File permissions - canExecute: ${frpcFile.canExecute()}, canRead: ${frpcFile.canRead()}")
            
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
            // Check if using native library
            if (useNativeLibrary) {
                if (nativeIsRunning()) {
                    promise.reject("ALREADY_RUNNING", "FRPC is already running")
                    return
                }
                
                val result = nativeStartFRPC(configPath)
                if (result == 0) {
                    Log.d(TAG, "FRPC started successfully using native library")
                    promise.resolve("FRPC started successfully (native)")
                } else {
                    promise.reject("START_ERROR", "Native FRPC failed with code: $result")
                }
                return
            }
            
            if (frpcProcess != null && frpcProcess!!.isAlive) {
                promise.reject("ALREADY_RUNNING", "FRPC is already running")
                return
            }
            
            val frpcBinary = File(context.filesDir, FRPC_BINARY_NAME)
            if (!frpcBinary.exists()) {
                // Try native library as fallback
                Log.w(TAG, "Binary not found, trying native library fallback")
                return tryNativeLibraryFallback(configPath, promise)
            }
            
            // Try different execution methods for Android compatibility
            val processBuilder = if (frpcBinary.canExecute()) {
                ProcessBuilder(
                    frpcBinary.absolutePath,
                    "-c",
                    configPath
                )
            } else {
                // Fallback: try executing with sh
                Log.w(TAG, "Binary not executable, trying with sh")
                ProcessBuilder(
                    "sh",
                    "-c",
                    "${frpcBinary.absolutePath} -c $configPath"
                )
            }
            
            processBuilder.directory(context.filesDir)
            processBuilder.redirectErrorStream(true)
            
            frpcProcess = processBuilder.start()
            
            // Monitor process output
            executor.submit {
                monitorProcess()
            }
            
            Log.d(TAG, "FRPC started successfully using binary")
            promise.resolve("FRPC started successfully (binary)")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start FRPC with binary: ${e.message}")
            // Try native library as fallback
            tryNativeLibraryFallback(configPath, promise)
        }
    }
    
    private fun tryNativeLibraryFallback(configPath: String, promise: Promise) {
        try {
            Log.d(TAG, "Attempting native library fallback")
            
            if (nativeIsRunning()) {
                promise.reject("ALREADY_RUNNING", "FRPC is already running")
                return
            }
            
            val result = nativeStartFRPC(configPath)
            if (result == 0) {
                useNativeLibrary = true
                Log.d(TAG, "FRPC started successfully using native library fallback")
                promise.resolve("FRPC started successfully (native fallback)")
            } else if (result == -999) {
                // Stub implementation - native library not fully implemented
                Log.d(TAG, "Native library is stub implementation, binary execution already failed")
                promise.reject("START_ERROR", "Binary execution failed and native library is not fully implemented")
            } else {
                promise.reject("START_ERROR", "Both binary and native library failed. Native error code: $result")
            }
        } catch (e: UnsatisfiedLinkError) {
            promise.reject("NATIVE_NOT_AVAILABLE", "Native library not available and binary execution failed")
        } catch (e: Exception) {
            promise.reject("START_ERROR", "All FRPC start methods failed: ${e.message}")
        }
    }
    
    @ReactMethod
    fun stopFRPC(promise: Promise) {
        try {
            // Stop native library if being used
            if (useNativeLibrary) {
                val result = nativeStopFRPC()
                if (result == 0) {
                    Log.d(TAG, "FRPC stopped successfully (native)")
                    promise.resolve("FRPC stopped successfully (native)")
                } else {
                    promise.reject("STOP_ERROR", "Failed to stop native FRPC: $result")
                }
                return
            }
            
            // Stop binary process
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
                    
                    Log.d(TAG, "FRPC stopped (binary)")
                    promise.resolve("FRPC stopped successfully (binary)")
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
        try {
            val isRunning = if (useNativeLibrary) {
                nativeIsRunning()
            } else {
                frpcProcess?.isAlive ?: false
            }
            promise.resolve(isRunning)
        } catch (e: Exception) {
            // Fallback to binary check
            val isRunning = frpcProcess?.isAlive ?: false
            promise.resolve(isRunning)
        }
    }
    
    @ReactMethod
    fun checkBinaryPermissions(promise: Promise) {
        try {
            val frpcBinary = File(context.filesDir, FRPC_BINARY_NAME)
            if (!frpcBinary.exists()) {
                promise.reject("BINARY_NOT_FOUND", "FRPC binary not found")
                return
            }
            
            val result = Arguments.createMap()
            result.putBoolean("exists", frpcBinary.exists())
            result.putBoolean("canRead", frpcBinary.canRead())
            result.putBoolean("canWrite", frpcBinary.canWrite())
            result.putBoolean("canExecute", frpcBinary.canExecute())
            result.putString("path", frpcBinary.absolutePath)
            result.putDouble("size", frpcBinary.length().toDouble())
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", "Failed to check permissions: ${e.message}")
        }
    }
    
    @ReactMethod
    fun fixBinaryPermissions(promise: Promise) {
        try {
            val frpcBinary = File(context.filesDir, FRPC_BINARY_NAME)
            if (!frpcBinary.exists()) {
                promise.reject("BINARY_NOT_FOUND", "FRPC binary not found")
                return
            }
            
            // Force set permissions
            frpcBinary.setExecutable(true, false)
            frpcBinary.setReadable(true, false)
            frpcBinary.setWritable(true, true)
            
            // Try chmod again
            try {
                val chmodProcess = Runtime.getRuntime().exec(arrayOf("chmod", "755", frpcBinary.absolutePath))
                val exitCode = chmodProcess.waitFor()
                Log.d(TAG, "chmod result: $exitCode")
            } catch (e: Exception) {
                Log.w(TAG, "chmod failed: ${e.message}")
            }
            
            promise.resolve("Permissions updated")
        } catch (e: Exception) {
            promise.reject("FIX_ERROR", "Failed to fix permissions: ${e.message}")
        }
    }
    
    @ReactMethod
    fun runComprehensiveDiagnostics(promise: Promise) {
        try {
            val diagnostics = Arguments.createMap()
            val issues = Arguments.createArray()
            val warnings = Arguments.createArray()
            
            // 1. Check device architecture compatibility
            val deviceArch = Build.CPU_ABI
            diagnostics.putString("deviceArchitecture", deviceArch)
            if (!deviceArch.contains("arm64")) {
                issues.pushString("Device architecture ($deviceArch) may not be compatible with ARM64 binary")
            }
            
            // 2. Check Android version and security restrictions
            val androidVersion = Build.VERSION.SDK_INT
            diagnostics.putInt("androidVersion", androidVersion)
            if (androidVersion >= 29) { // Android 10+
                warnings.pushString("Android 10+ has stricter binary execution policies")
            }
            if (androidVersion >= 30) { // Android 11+
                issues.pushString("Android 11+ may block binary execution due to scoped storage")
            }
            
            // 3. Check binary file status
            val frpcBinary = File(context.filesDir, FRPC_BINARY_NAME)
            val binaryStatus = Arguments.createMap()
            binaryStatus.putBoolean("exists", frpcBinary.exists())
            if (frpcBinary.exists()) {
                binaryStatus.putBoolean("canRead", frpcBinary.canRead())
                binaryStatus.putBoolean("canWrite", frpcBinary.canWrite())
                binaryStatus.putBoolean("canExecute", frpcBinary.canExecute())
                binaryStatus.putDouble("sizeBytes", frpcBinary.length().toDouble())
                binaryStatus.putString("path", frpcBinary.absolutePath)
                
                if (!frpcBinary.canExecute()) {
                    issues.pushString("FRPC binary exists but is not executable")
                }
                if (frpcBinary.length() < 1000000) { // Less than 1MB
                    warnings.pushString("FRPC binary size seems too small (${frpcBinary.length()} bytes)")
                }
            } else {
                issues.pushString("FRPC binary not found - call installFRPCBinary() first")
            }
            diagnostics.putMap("binaryStatus", binaryStatus)
            
            // 4. Check network permissions and connectivity
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val networkInfo = connectivityManager.activeNetworkInfo
            val networkStatus = Arguments.createMap()
            networkStatus.putBoolean("hasActiveNetwork", networkInfo?.isConnected == true)
            networkStatus.putString("networkType", networkInfo?.typeName ?: "None")
            diagnostics.putMap("networkStatus", networkStatus)
            
            if (networkInfo?.isConnected != true) {
                issues.pushString("No active network connection")
            }
            
            // 5. Check FRPC server connectivity
            executor.submit {
                try {
                    val socket = Socket()
                    socket.connect(InetSocketAddress("staging.ai.avzdax.com", 7000), 5000)
                    socket.close()
                    Log.d(TAG, "FRPC server is reachable")
                } catch (e: Exception) {
                    Log.w(TAG, "FRPC server connectivity issue: ${e.message}")
                }
            }
            
            // 6. Check file system permissions
            val filesDir = context.filesDir
            val fileSystemStatus = Arguments.createMap()
            fileSystemStatus.putBoolean("canWriteToFilesDir", filesDir.canWrite())
            fileSystemStatus.putString("filesDir", filesDir.absolutePath)
            diagnostics.putMap("fileSystemStatus", fileSystemStatus)
            
            if (!filesDir.canWrite()) {
                issues.pushString("Cannot write to app files directory")
            }
            
            // 7. Check SELinux status (if accessible)
            try {
                val selinuxStatus = Runtime.getRuntime().exec("getenforce").inputStream.bufferedReader().readText().trim()
                diagnostics.putString("selinuxStatus", selinuxStatus)
                if (selinuxStatus.equals("Enforcing", ignoreCase = true)) {
                    warnings.pushString("SELinux is enforcing - may block binary execution")
                }
            } catch (e: Exception) {
                diagnostics.putString("selinuxStatus", "Unknown")
            }
            
            // 8. Check available memory
            val runtime = Runtime.getRuntime()
            val memoryStatus = Arguments.createMap()
            memoryStatus.putDouble("freeMemoryMB", runtime.freeMemory() / 1024.0 / 1024.0)
            memoryStatus.putDouble("totalMemoryMB", runtime.totalMemory() / 1024.0 / 1024.0)
            diagnostics.putMap("memoryStatus", memoryStatus)
            
            if (runtime.freeMemory() < 50 * 1024 * 1024) { // Less than 50MB
                warnings.pushString("Low available memory (${runtime.freeMemory() / 1024 / 1024}MB)")
            }
            
            // 9. Check config file
            val configFile = File(context.filesDir, "frpc.ini")
            val configStatus = Arguments.createMap()
            configStatus.putBoolean("exists", configFile.exists())
            if (configFile.exists()) {
                configStatus.putDouble("sizeBytes", configFile.length().toDouble())
                configStatus.putBoolean("canRead", configFile.canRead())
            } else {
                warnings.pushString("FRPC config file not found - call generateConfig() first")
            }
            diagnostics.putMap("configStatus", configStatus)
            
            // 10. Check native library availability
            var nativeLibraryAvailable = false
            try {
                nativeIsRunning()
                nativeLibraryAvailable = true
            } catch (e: UnsatisfiedLinkError) {
                // Native library not available
            } catch (e: Exception) {
                // Other error
            }
            diagnostics.putBoolean("nativeLibraryAvailable", nativeLibraryAvailable)
            
            // Compile results
            diagnostics.putArray("issues", issues)
            diagnostics.putArray("warnings", warnings)
            diagnostics.putInt("issueCount", issues.size())
            diagnostics.putInt("warningCount", warnings.size())
            
            val overallStatus = when {
                issues.size() > 0 -> "CRITICAL_ISSUES"
                warnings.size() > 2 -> "MULTIPLE_WARNINGS"
                warnings.size() > 0 -> "MINOR_WARNINGS"
                else -> "HEALTHY"
            }
            diagnostics.putString("overallStatus", overallStatus)
            
            Log.d(TAG, "Diagnostics completed: $overallStatus with ${issues.size()} issues and ${warnings.size()} warnings")
            promise.resolve(diagnostics)
            
        } catch (e: Exception) {
            Log.e(TAG, "Diagnostics failed", e)
            promise.reject("DIAGNOSTICS_ERROR", "Failed to run diagnostics: ${e.message}")
        }
    }
    
    @ReactMethod
    fun testFRPCExecution(promise: Promise) {
        try {
            val frpcBinary = File(context.filesDir, FRPC_BINARY_NAME)
            if (!frpcBinary.exists()) {
                promise.reject("BINARY_NOT_FOUND", "FRPC binary not found")
                return
            }
            
            // Test execution with --version flag (safe, doesn't start service)
            executor.submit {
                try {
                    val processBuilder = ProcessBuilder(
                        frpcBinary.absolutePath,
                        "--version"
                    )
                    processBuilder.directory(context.filesDir)
                    processBuilder.redirectErrorStream(true)
                    
                    val process = processBuilder.start()
                    val output = process.inputStream.bufferedReader().readText()
                    val exitCode = process.waitFor()
                    
                    val result = Arguments.createMap()
                    result.putInt("exitCode", exitCode)
                    result.putString("output", output)
                    result.putBoolean("canExecute", exitCode == 0)
                    
                    if (exitCode == 0) {
                        Log.d(TAG, "FRPC test execution successful: $output")
                        promise.resolve(result)
                    } else {
                        Log.w(TAG, "FRPC test execution failed with exit code: $exitCode")
                        // Try shell execution as fallback
                        testShellExecution(frpcBinary, promise, result)
                    }
                    
                } catch (e: Exception) {
                    Log.e(TAG, "FRPC test execution failed", e)
                    // Try shell execution as fallback
                    testShellExecution(frpcBinary, promise, null)
                }
            }
            
        } catch (e: Exception) {
            promise.reject("TEST_ERROR", "Failed to test FRPC execution: ${e.message}")
        }
    }
    
    private fun testShellExecution(frpcBinary: File, promise: Promise, previousResult: WritableMap?) {
        try {
            val processBuilder = ProcessBuilder(
                "/system/bin/sh",
                "-c",
                "${frpcBinary.absolutePath} --version"
            )
            processBuilder.directory(context.filesDir)
            processBuilder.redirectErrorStream(true)
            
            val process = processBuilder.start()
            val output = process.inputStream.bufferedReader().readText()
            val exitCode = process.waitFor()
            
            val result = previousResult ?: Arguments.createMap()
            result.putInt("shellExitCode", exitCode)
            result.putString("shellOutput", output)
            result.putBoolean("shellCanExecute", exitCode == 0)
            result.putBoolean("canExecute", exitCode == 0)
            
            if (exitCode == 0) {
                Log.d(TAG, "FRPC shell execution successful: $output")
                promise.resolve(result)
            } else {
                Log.e(TAG, "Both direct and shell execution failed")
                result.putString("error", "Both direct and shell execution failed")
                promise.reject("EXECUTION_FAILED", "FRPC cannot be executed", result)
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Shell execution test failed", e)
            val result = previousResult ?: Arguments.createMap()
            result.putString("shellError", e.message)
            promise.reject("SHELL_TEST_ERROR", "Shell execution test failed: ${e.message}", result)
        }
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