cmake_minimum_required(VERSION 3.18.1)
project(frpc-jni)

add_library(frpc-jni SHARED frpc_wrapper.cpp)
target_link_libraries(frpc-jni log dl android)