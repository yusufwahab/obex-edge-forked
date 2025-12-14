# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep FRPC native methods
-keep class com.yusufwahabraotech.obexedge.frpc.FRPCModule {
    native <methods>;
}

# Keep React Native bridge methods
-keep class com.yusufwahabraotech.obexedge.frpc.FRPCModule {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep service class
-keep class com.yusufwahabraotech.obexedge.frpc.FRPCService

# Prevent obfuscation of binary execution methods
-keep class com.yusufwahabraotech.obexedge.frpc.** { *; }

# Keep Android system classes used for execution
-keep class android.os.** { *; }
-keep class java.lang.ProcessBuilder { *; }
-keep class java.lang.Process { *; }