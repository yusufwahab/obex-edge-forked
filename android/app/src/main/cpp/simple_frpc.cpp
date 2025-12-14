#include <jni.h>
#include <android/log.h>

#define LOG_TAG "SimpleFRPC"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

// Simple stub implementation that returns "not implemented" codes
// This allows the app to build and run, falling back to binary execution

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStartFRPC(JNIEnv *env, jclass clazz, jstring config_path) {
    LOGI("Native FRPC start called - using binary fallback");
    return -999; // Special code indicating "use binary fallback"
}

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStopFRPC(JNIEnv *env, jclass clazz) {
    LOGI("Native FRPC stop called - using binary fallback");
    return -999; // Special code indicating "use binary fallback"
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeIsRunning(JNIEnv *env, jclass clazz) {
    return JNI_FALSE; // Always return false, let binary handle it
}