package com.anonymous.obexedge

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.anonymous.obexedge.frpc.FRPCPackage

class MainApplication : Application(), ReactApplication {

  init {
    android.util.Log.d("MainApplication", "=== MainApplication initialized ===")
  }

  override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getPackages(): List<ReactPackage> {
      android.util.Log.d("MainApplication", "=== getPackages() called ===")
      val packages = mutableListOf<ReactPackage>()
      
      try {
        android.util.Log.d("MainApplication", "Creating FRPCPackage...")
        val frpcPackage = FRPCPackage()
        packages.add(frpcPackage)
        android.util.Log.d("MainApplication", "✅ FRPCPackage added successfully")
        println("BUILD LOG: FRPCPackage created successfully")
      } catch (e: Exception) {
        android.util.Log.e("MainApplication", "❌ Failed to create FRPCPackage", e)
        println("BUILD ERROR: Failed to create FRPCPackage: ${e.message}")
        e.printStackTrace()
      }
      
      android.util.Log.d("MainApplication", "Total packages: ${packages.size}")
      return packages
    }

    override fun getJSMainModuleName(): String = "index"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
  }
}
