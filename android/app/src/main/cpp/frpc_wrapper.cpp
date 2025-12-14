#include <jni.h>
#include <dlfcn.h>
#include <android/log.h>
#include <thread>
#include <string>
#include <unistd.h>
#include <sys/wait.h>

#define LOG_TAG "FRPCWrapper"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static pid_t frpc_pid = 0;

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStartFRPCWithCMake(
    JNIEnv* env, jobject /* this */, jstring config_path, jstring binary_path) {
    
    const char* config = env->GetStringUTFChars(config_path, nullptr);
    const char* binary = env->GetStringUTFChars(binary_path, nullptr);
    
    LOGI("🚀 CMake fallback: Starting FRPC with config: %s", config);
    LOGI("📁 Using binary: %s", binary);
    
    // Fork process to run FRPC
    frpc_pid = fork();
    
    if (frpc_pid == 0) {
        // Child process - execute FRPC
        LOGI("🔄 Child process executing FRPC...");
        
        // Try multiple execution methods
        execl(binary, "frpc", "-c", config, (char*)nullptr);
        
        // If execl fails, try with shell
        execl("/system/bin/sh", "sh", "-c", binary, "-c", config, (char*)nullptr);
        
        // If all fails, exit
        LOGE("❌ All execution methods failed in child process");
        _exit(1);
        
    } else if (frpc_pid > 0) {
        // Parent process
        LOGI("✅ FRPC started with PID: %d", frpc_pid);
        
        env->ReleaseStringUTFChars(config_path, config);
        env->ReleaseStringUTFChars(binary_path, binary);
        
        return 0; // Success
        
    } else {
        // Fork failed
        LOGE("❌ Failed to fork process");
        
        env->ReleaseStringUTFChars(config_path, config);
        env->ReleaseStringUTFChars(binary_path, binary);
        
        return -1; // Failure
    }
}

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStopFRPCWithCMake(
    JNIEnv* env, jobject /* this */) {
    
    if (frpc_pid > 0) {
        LOGI("🛑 Stopping FRPC process (PID: %d)", frpc_pid);
        
        // Send SIGTERM
        if (kill(frpc_pid, SIGTERM) == 0) {
            // Wait for process to terminate
            int status;
            if (waitpid(frpc_pid, &status, WNOHANG) == frpc_pid) {
                LOGI("✅ FRPC stopped gracefully");
            } else {
                // Force kill if needed
                kill(frpc_pid, SIGKILL);
                waitpid(frpc_pid, &status, 0);
                LOGI("🔨 FRPC force killed");
            }
            
            frpc_pid = 0;
            return 0;
        } else {
            LOGE("❌ Failed to stop FRPC process");
            return -1;
        }
    } else {
        LOGI("ℹ️ FRPC not running");
        return 0;
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeIsRunningWithCMake(
    JNIEnv* env, jobject /* this */) {
    
    if (frpc_pid > 0) {
        // Check if process is still alive
        if (kill(frpc_pid, 0) == 0) {
            return JNI_TRUE;
        } else {
            // Process died
            frpc_pid = 0;
            return JNI_FALSE;
        }
    }
    
    return JNI_FALSE;
}