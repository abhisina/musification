#
# Dependencies
#
find_package(Threads)

#
# Sources
#
set(SOURCES
    src/main.cc
)

source_group(TREE ${CMAKE_CURRENT_SOURCE_DIR} FILES ${SOURCES})

#
# Target
#
add_executable(client-native ${SOURCES})
target_link_libraries(client-native PRIVATE servicepb)