/**
 * @fileoverview gRPC-Web generated client stub for messaging
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var google_protobuf_duration_pb = require('google-protobuf/google/protobuf/duration_pb.js')

var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js')

var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js')
const proto = {};
proto.messaging = require('./service_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.messaging.MusicServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.messaging.MusicServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.messaging.MusicDescription,
 *   !proto.messaging.FileChunk>}
 */
const methodDescriptor_MusicService_GetGeneratedMusic = new grpc.web.MethodDescriptor(
  '/messaging.MusicService/GetGeneratedMusic',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.messaging.MusicDescription,
  proto.messaging.FileChunk,
  /**
   * @param {!proto.messaging.MusicDescription} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.messaging.FileChunk.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.messaging.MusicDescription,
 *   !proto.messaging.FileChunk>}
 */
const methodInfo_MusicService_GetGeneratedMusic = new grpc.web.AbstractClientBase.MethodInfo(
  proto.messaging.FileChunk,
  /**
   * @param {!proto.messaging.MusicDescription} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.messaging.FileChunk.deserializeBinary
);


/**
 * @param {!proto.messaging.MusicDescription} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.messaging.FileChunk>}
 *     The XHR Node Readable Stream
 */
proto.messaging.MusicServiceClient.prototype.getGeneratedMusic =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/messaging.MusicService/GetGeneratedMusic',
      request,
      metadata || {},
      methodDescriptor_MusicService_GetGeneratedMusic);
};


/**
 * @param {!proto.messaging.MusicDescription} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.messaging.FileChunk>}
 *     The XHR Node Readable Stream
 */
proto.messaging.MusicServicePromiseClient.prototype.getGeneratedMusic =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/messaging.MusicService/GetGeneratedMusic',
      request,
      metadata || {},
      methodDescriptor_MusicService_GetGeneratedMusic);
};


module.exports = proto.messaging;

