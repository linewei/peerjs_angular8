import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { RoomService } from './room.service';

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
  peer: Peer;
  localStream: StreamInterface = null;
  remoteStreamArray: StreamInterface[] = [];

  constructor(private rs: RoomService, private ar: ApplicationRef) {
  }

  setupPeer(localStream: MediaStream) {
    const peerOptions: Peer.PeerJSOption = {
        host: '/',
        port: 9000,
        path: '/peerjs',
        secure: true,
        debug: 2
      };

    const localCandi = this.rs.getLocalCandiId();
    let peer: Peer|null = null;
    console.log(`Local stream id read from storage : ${localCandi}`);
    if ( localCandi && localCandi !== 'null') {
        peer = new Peer( localCandi, peerOptions);
    } else {
        peer = new Peer(peerOptions);
    }

    this.peer = peer;
    peer.on('open', (id) => {
      console.log('peer on open return localStream id: ', id);
      this.rs.setLocalCandiId(id);
      this.localStream = new StreamInterface(id, localStream);

      this.rs.joinRoom(id).subscribe((res) => {
        console.log(`return from http server : ${JSON.stringify(res)}`);
        const candidates = res;
        candidates.map((candi) => {
          console.log(`other candidates in the same room: ${candi.id}`);
          this.connectRemote(candi.id);
        });
      });
    });

    peer.on('disconnected', () => {
      console.log('Disconnnect from PeerServer.');
    });

    peer.on('error', (err) => {
      console.error('An error occurs : ' , err.type);
    });

    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(data);
      });
    });

    peer.on('call', (call: Peer.MediaConnection) => {
      const streamId = call.peer;

      call.answer(this.localStream.stream);
      call.on('stream', (remoteStream: MediaStream) => {

        console.log('Get answer remote video successed! id: ', streamId);
        console.log('Open : ', call.open);

        // streamId has existed!
        if (this.getRemoteStream(streamId)) {
          return ;
        }
        this.addRemoteStream(new StreamInterface(streamId, remoteStream));
        this.ar.tick();
      });

      call.on('close', () => {
        console.log(`Peer ${streamId} closed the connection!`);
        this.removeRemoteStream(streamId);
        this.ar.tick();
      });

      call.on('error', (err) => {
        console.log('Something error occurs!', JSON.stringify(err));
      });
    });
  }

  connectRemote(remoteId: string) {
    const peer = this.peer;

    const call: Peer.MediaConnection = peer.call(remoteId, this.localStream.stream);
    const streamId = call.peer;

    call.on('stream', (stream: MediaStream) => {
      console.log('Get call remote video successed! id: ', streamId);
      console.log('Open : ', call.open);

      // streamId has existed!
      if (this.getRemoteStream(streamId)) {
        return ;
      }

      this.addRemoteStream(new StreamInterface(streamId, stream));
      call.metadata = streamId;
      this.ar.tick();
    });

    call.on('close', () => {
      console.log(`Peer ${streamId} closed the connection!`);
      this.removeRemoteStream(streamId);
      this.ar.tick();
    });

    call.on('error', err => {
      console.log('Something error occurs!', JSON.stringify(err));
    });
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
