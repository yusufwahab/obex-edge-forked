#include <jni.h>
#include <string>
#include <unistd.h>
#include <sys/wait.h>
#include <android/log.h>
#include <pthread.h>
#include <signal.h>

#define LOG_TAG "FRPCNative"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static pid_t frpc_pid = -1;
static pthread_t frpc_thread;
static bool frpc_running = false;

struct FRPCThreadArgs {
    std::string config_path;
    std::string binary_path;
};

void* frpc_thread_func(void* args) {
    FRPCThreadArgs* thread_args = (FRPCThreadArgs*)args;
    
    LOGI("Starting FRPC with config: %s", thread_args->config_path.c_str());
    
    frpc_pid = fork();
    if (frpc_pid == 0) {
        // Child process - execute FRPC
        execl(thread_args->binary_path.c_str(), "frpc", "-c", thread_args->config_path.c_str(), (char*)NULL);
        LOGE("Failed to exec FRPC binary");
        _exit(1);
    } else if (frpc_pid > 0) {
        // Parent process - wait for child
        int status;
        frpc_running = true;
        waitpid(frpc_pid, &status, 0);
        frpc_running = false;
        frpc_pid = -1;
        LOGI("FRPC process exited with status: %d", status);
    } else {
        LOGE("Failed to fork FRPC process");
        frpc_running = false;
    }
    
    delete thread_args;
    return nullptr;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStartFRPC(JNIEnv *env, jclass clazz, jstring config_path) {
    if (frpc_running) {
        LOGI("FRPC is already running");
        return -1; // Already running
    }
    
    const char* config_path_str = env->GetStringUTFChars(config_path, 0);
    
    // Get the app's files directory and construct binary path
    // This assumes the binary is in the same directory as the config
    std::string config_str(config_path_str);
    size_t last_slash = config_str.find_last_of('/');
    std::string files_dir = config_str.substr(0, last_slash);
    std::string binary_path = files_dir + "/frpc";
    
    env->ReleaseStringUTFChars(config_path, config_path_str);
    
    // Check if binary exists and is executable
    if (access(binary_path.c_str(), X_OK) != 0) {
        LOGE("FRPC binary not found or not executable: %s", binary_path.c_str());
        return -2; // Binary not found/executable
    }
    
    // Create thread arguments
    FRPCThreadArgs* args = new FRPCThreadArgs();
    args->config_path = config_str;
    args->binary_path = binary_path;
    
    // Start FRPC in a separate thread
    int result = pthread_create(&frpc_thread, nullptr, frpc_thread_func, args);
    if (result != 0) {
        LOGE("Failed to create FRPC thread: %d", result);
        delete args;
        return -3; // Thread creation failed
    }
    
    // Detach thread so it can run independently
    pthread_detach(frpc_thread);
    
    // Give it a moment to start
    usleep(100000); // 100ms
    
    LOGI("FRPC native start initiated successfully");
    return 0; // Success
}

extern "C" JNIEXPORT jint JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeStopFRPC(JNIEnv *env, jclass clazz) {
    if (!frpc_running || frpc_pid <= 0) {
        LOGI("FRPC is not running");
        return 0; // Not running, consider it stopped
    }
    
    LOGI("Stopping FRPC process: %d", frpc_pid);
    
    // Send SIGTERM first
    if (kill(frpc_pid, SIGTERM) == 0) {
        // Wait a bit for graceful shutdown
        usleep(2000000); // 2 seconds
        
        // Check if still running
        if (kill(frpc_pid, 0) == 0) {
            // Still running, force kill
            LOGI("Force killing FRPC process");
            kill(frpc_pid, SIGKILL);
        }
        
        frpc_running = false;
        frpc_pid = -1;
        return 0; // Success
    } else {
        LOGE("Failed to send signal to FRPC process");
        return -1; // Failed to stop
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_yusufwahabraotech_obexedge_frpc_FRPCModule_nativeIsRunning(JNIEnv *env, jclass clazz) {
    if (!frpc_running || frpc_pid <= 0) {
        return JNI_FALSE;
    }
    
    // Check if process is still alive
    if (kill(frpc_pid, 0) == 0) {
        return JNI_TRUE;
    } else {
        // Process is dead, update our state
        frpc_running = false;
        frpc_pid = -1;
        return JNI_FALSE;
    }
}