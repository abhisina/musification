#include <iostream>
#include <string>
#include <memory>
#include <fstream>
#define _USE_MATH_DEFINES
#include <cmath>

#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>
#include <grpcpp/ext/proto_server_reflection_plugin.h>

#include "pb/service.grpc.pb.h"

class MusicServiceImpl final : public ::messaging::MusicService::Service
{
    public:
    ::grpc::Status GetGeneratedMusic(::grpc::ServerContext* context,
                               const ::messaging::MusicDescription* request,
                                     ::grpc::ServerWriter< ::messaging::FileChunk>* writer) override
    {
        std::cout << "Following is the request description:\n";
        std::cout << "Duration: " << request->duration().seconds() << ':' << request->duration().nanos() << '\n';
        std::cout << "Video filename: " << request->videofilename() << '\n';
        std::cout << "Sending source audio file: " << std::boolalpha << request->sendingsourceaudiofile() << std::noboolalpha << '\n';
        for(int i = 0 ; i < request->scenes_size(); ++i)
        {
            std::cout << "Mood: " << request->scenes(i).mood() << " StartTime: " << request->scenes(i).starttime().seconds() << ':' << request->scenes(i).starttime().nanos() << '\n';
        }

        ::messaging::FileChunk fileChunk;

        // generate a 16 bit sine wave of the given duration
        const int samplesize = 16;
        const long samples = 44100 * request->duration().seconds() + (44100L * request->duration().nanos() / 1000000000); // per channel

        std::cout << "samples count: " << samples << '\n';
        int index = 0;
        char buffer[4096];
        char* bufPtr = buffer;

        for(long i = 0 ; i < samples ; ++i)
        {
            int sinus = 0.4 * 0x8000 * sin(2 * M_PI * 440 * i / 44100);
            memcpy(bufPtr, &sinus, 2);
            index += 2; bufPtr += 2;
            if(index >= sizeof(buffer) || (i == (samples - 1)))
            {
                fileChunk.set_content(buffer, index);
                writer->Write(fileChunk);
                bufPtr = buffer; index = 0;
            }
        }

        return ::grpc::Status::OK;
    }
};

int main(int argc, char* argv[])
{
    std::string server_address("0.0.0.0:8080");
    MusicServiceImpl service;

    ::grpc::EnableDefaultHealthCheckService(true);
    ::grpc::reflection::InitProtoReflectionServerBuilderPlugin();
    ::grpc::ServerBuilder builder;
    builder.AddListeningPort(server_address, ::grpc::InsecureServerCredentials());
    builder.RegisterService(&service);
    std::unique_ptr<::grpc::Server> server(builder.BuildAndStart());
    std::cout << "Server listening on " << server_address << '\n';
    server->Wait();
}