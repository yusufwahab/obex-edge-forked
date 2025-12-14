#include <jni.h>
#include <string>
#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>
#include <android/log.h>

#define LOG_TAG "FRPCWrapper"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeExecuteFRPC(
        JNIEnv *env,
        jobject /* this */,
        jstring binaryPath,
        jstring configPath) {

    const char *binaryPathStr = env->GetStringUTFChars(binaryPath, 0);
    const char *configPathStr = env->GetStringUTFChars(configPath, 0);

    LOGI("Native FRPC execution: %s with config %s", binaryPathStr, configPathStr);

    pid_t pid = fork();
    if (pid == 0) {
        // Child process
        execl(binaryPathStr, "frpc", "-c", configPathStr, (char *)NULL);
        LOGE("execl failed");
        _exit(1);
    } else if (pid > 0) {
        // Parent process
        LOGI("FRPC process started with PID: %d", pid);
        env->ReleaseStringUTFChars(binaryPath, binaryPathStr);
        env->ReleaseStringUTFChars(configPath, configPathStr);
        return pid;
    } else {
        // Fork failed
        LOGE("Fork failed");
        env->ReleaseStringUTFChars(binaryPath, binaryPathStr);
        env->ReleaseStringUTFChars(configPath, configPathStr);
        return -1;
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStopFRPC(
        JNIEnv *env,
        jobject /* this */,
        jint pid) {

    if (pid > 0) {
        LOGI("Stopping FRPC process with PID: %d", pid);
        int result = kill(pid, SIGTERM);
        if (result == 0) {
            // Wait for process to terminate
            int status;
            waitpid(pid, &status, 0);
            LOGI("FRPC process terminated");
            return JNI_TRUE;
        } else {
            LOGE("Failed to kill process");
            return JNI_FALSE;
        }
    }
    return JNI_FALSE;
}