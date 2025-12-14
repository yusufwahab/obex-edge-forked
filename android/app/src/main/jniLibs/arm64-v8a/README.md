# FRPC Native Library (ARM64)

Place `libfrpc.so` here for ARM64 devices (most modern phones).

## Build Instructions:
```bash
export ANDROID_NDK_HOME=~/Android/Sdk/ndk/27.1.12297006
export CGO_ENABLED=1
export GOOS=android
export GOARCH=arm64
export CC=$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android33-clang

go build -buildmode=c-shared -o libfrpc.so ./cmd/frpc/wrapper.go
```

Copy the generated `libfrpc.so` to this directory.