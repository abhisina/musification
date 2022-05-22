#!/bin/bash

#docker build -t grpc-envoy:1.0 .
docker run --network=host grpc-envoy:1.0
