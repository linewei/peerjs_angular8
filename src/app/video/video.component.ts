import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StreamInterface, VideoService } from './video.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from './room.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.sass']
})
export class VideoComponent implements OnInit {
  peer: Peer;

  constructor(
    private cd: ChangeDetectorRef,
    public vs: VideoService,
    private route: ActivatedRoute,
    private rs: RoomService
    ) {}

  setupPeer(localStream: MediaStream) {
    const peerOptions: Peer.PeerJSOption = {
        host: 'localhost',
        port: 9000,
        path: '/peerjs',
        secure: false,
        debug: 2
      };

    const localCandi = this.rs.getLocalCandiId();
    let peer: Peer;
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
      this.vs.setLocalStream(new StreamInterface(id, localStream));

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

      call.answer(this.vs.getLocalStream().stream);
      call.on('stream', (remoteStream: MediaStream) => {

        console.log('Get answer remote video successed! id: ', streamId);
        console.log('Open : ', call.open);

        // streamId has existed!
        if (this.vs.getRemoteStream(streamId)) {
          return ;
        }
        this.vs.addRemoteStream(new StreamInterface(streamId, remoteStream));
        this.cd.markForCheck();
        this.cd.detectChanges();
      });

      call.on('close', () => {
        console.log(`Peer ${streamId} closed the connection!`);
        this.vs.removeRemoteStream(streamId);
        this.cd.markForCheck();
        this.cd.detectChanges();

        this.rs.leaveRoom(streamId).subscribe((res) => {
          console.log(`Tell server remove ${streamId}. server return: ${res}.`);
        });
      });

      call.on('error', (err) => {
        console.log('Something error occurs!', JSON.stringify(err));
      });
    });
  }
  ngOnInit() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream: MediaStream) => {
          console.log('Get local stream success!');

          this.setupPeer(stream);

          this.route.paramMap.subscribe((params) => {
            this.rs.roomId = params.get('roomid');
            console.log(`Room id: ${this.rs.roomId}`);
          });
        })
        .catch(err => {
          console.log('Failed to get stream', err);
        });
  }

  connectRemote(remoteId: string) {
    const peer = this.peer;

    const call: Peer.MediaConnection = peer.call(remoteId, this.vs.getLocalStream().stream);
    const streamId = call.peer;

    call.on('stream', (stream: MediaStream) => {
      console.log('Get call remote video successed! id: ', streamId);
      console.log('Open : ', call.open);

      // streamId has existed!
      if (this.vs.getRemoteStream(streamId)) {
        return ;
      }

      this.vs.addRemoteStream(new StreamInterface(streamId, stream));
      call.metadata = streamId;
      this.cd.markForCheck();
      this.cd.detectChanges();
    });

    call.on('close', () => {
      console.log(`Peer ${streamId} closed the connection!`);
      this.vs.removeRemoteStream(streamId);
      this.cd.markForCheck();
      this.cd.detectChanges();

      this.rs.leaveRoom(streamId).subscribe((res) => {
        console.log(`Tell server remove ${streamId}. server return: ${res}.`);
      });
    });

    call.on('error', err => {
      console.log('Something error occurs!', JSON.stringify(err));
    });
  }

  trackByStream(index: number, item: StreamInterface) {
    return item.id;
  }
}
