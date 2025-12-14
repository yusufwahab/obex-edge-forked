cmake_minimum_required(VERSION 3.18.1)

project("frpc")

add_library(
    frpc
    SHARED
    simple_frpc.cpp
)

find_library(
    log-lib
    log
)

target_link_libraries(
    frpc
    ${log-lib}
)