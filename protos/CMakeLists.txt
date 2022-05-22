find_package(protobuf CONFIG REQUIRED)
find_package(gRPC CONFIG REQUIRED)
find_package(Threads)

#
# protobuf / gRPC source files
#
set(PROTO_FILES
    pb/service.proto
)

#
# add library target with protobuf sources
#
add_library(servicepb ${PROTO_FILES})
target_link_libraries(servicepb PUBLIC protobuf::libprotobuf gRPC::grpc gRPC::grpc++ gRPC::grpc++_reflection)
target_include_directories(servicepb PUBLIC ${CMAKE_CURRENT_BINARY_DIR})

#
# compile protobuf and gRPC files in proto to cpp
#
get_target_property(grpc_cpp_plugin_location gRPC::grpc_cpp_plugin LOCATION)
protobuf_generate(TARGET servicepb LANGUAGE cpp)
protobuf_generate(TARGET servicepb LANGUAGE grpc GENERATE_EXTENSIONS .grpc.pb.h .grpc.pb.cc PLUGIN "protoc-gen-grpc=${grpc_cpp_plugin_location}")