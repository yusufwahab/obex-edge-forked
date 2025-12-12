package com.anonymous.obexedge.frpc

import android.util.Log
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class FRPCPackage : ReactPackage {
    
    init {
        Log.d("FRPCPackage", "=== FRPCPackage constructor called ===")
    }
    
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        Log.d("FRPCPackage", "=== createNativeModules() called ===")
        try {
            val module = FRPCModule(reactContext)
            Log.d("FRPCPackage", "✅ Created FRPCModule with name: ${module.name}")
            return listOf(module)
        } catch (e: Exception) {
            Log.e("FRPCPackage", "❌ Failed to create FRPCModule", e)
            return emptyList()
        }
    }
    
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}