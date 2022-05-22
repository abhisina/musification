#include <iostream>
#include <string>
#include <memory>
#include <fstream>

#include <grpcpp/grpcpp.h>
#include "pb/service.grpc.pb.h"

int main(int argc, char* argv[])
{
    std::string target_str("localhost:8080");
    ::grpc::ClientContext context;
    ::messaging::MusicDescription musicDescription;

    google::protobuf::Duration* duration = new google::protobuf::Duration;
    duration->set_seconds(237);
    duration->set_nanos(2200000);

    musicDescription.set_allocated_duration(duration);
    musicDescription.set_videofilename("XXX.YYY");
    musicDescription.set_sendingsourceaudiofile(false);

    std::vector<std::string> moods = {"Breathy", "Bright", "Catchy", "Creepy", "Endless", "Energetic", "Grungy", "Memories", "Moving", "Rebellious", "Romantic", "Sad", "Happy"};
    std::vector<std::pair<int32_t, int64_t>> timeStamps = {{0,0},          {10, 4270999},  {19, 1441000},  {23, 3983999},  {29, 8631999}, 
                                                           {34, 5762000},  {41, 9585999},  {49, 7997000},  {56, 1811000},  {60, 7272999}, 
                                                           {69, 8196999},  {83, 4583999},  {91, 2994999},  {99, 2657999},  {108, 7750000}, 
                                                           {112, 4039999}, {117, 7429999}, {122, 4969999}, {132, 2150000}, {137, 6790000}, 
                                                           {210, 5020000}, {221, 5130000}, {223, 7239999}, {225, 9339999}, {230, 4799999}};

    for(int i = 0 ; i < 5 ; ++i)
    {
        auto* scene = musicDescription.add_scenes();
        google::protobuf::Timestamp* timestamp = new google::protobuf::Timestamp;
        timestamp->set_seconds(0);
        timestamp->set_nanos(0);
        scene->set_allocated_starttime(timestamp);
        scene->set_mood("Sad");
    }

    std::unique_ptr<::messaging::MusicService::Stub> musicServiceStub(::messaging::MusicService::NewStub(::grpc::CreateChannel(target_str, ::grpc::InsecureChannelCredentials())));
    std::unique_ptr< ::grpc::ClientReader< ::messaging::FileChunk>> musicReader = musicServiceStub->GetGeneratedMusic(&context, musicDescription);
    ::messaging::FileChunk musicResponse;
    std::ofstream fileWriter("data.pcm", std::ios::out | std::ios::binary);

    while(musicReader->Read(&musicResponse))
    {
        const std::string &content = musicResponse.content();
        fileWriter.write(content.c_str(), content.length());
    }

    std::cout << "Received file!\n";
}