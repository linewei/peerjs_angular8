import { Injectable } from '@angular/core';

export class StreamInterface {
  id: string;
  stream: MediaStream;

  constructor(id, stream) {
    this.id = id;
    this.stream = stream;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  localStream: StreamInterface = null;
  remoteStreamArray: StreamInterface[] = [];

  constructor() {
  }

  getLocalStream() {
    return this.localStream;
  }

  getLocalStreamId() {
    return this.localStream ? this.localStream.id : null;
  }

  getLocalStreamStream() {
    return this.localStream ? this.localStream.stream : null;
  }


  getRemoteStreamArray() {
    return this.remoteStreamArray;
  }

  getRemoteStream(id: string) {
    return this.remoteStreamArray.find(stream => stream.id === id);
  }

  setLocalStream(stream: StreamInterface) {
    this.localStream = stream;
  }

  addRemoteStream(stream: StreamInterface) {
    this.remoteStreamArray.push(stream);
  }

  removeRemoteStream(streamId) {
    this.remoteStreamArray = this.remoteStreamArray.filter((stream) => {
      return stream.id !== streamId;
    });
    console.log(`Remove streamId ${streamId} , left array length  ${this.getRemoteStreamArray().length}`);
  }
}
