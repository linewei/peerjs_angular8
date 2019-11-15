import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

interface StreamInterface {
  id: string;
  stream: MediaStream;
}

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.sass']
})
export class VideoComponent implements OnInit {
  peer: Peer;
  inputValue: string;
  localStream: StreamInterface;
  remoteStreamArray: StreamInterface[] = [];

  constructor(private cd: ChangeDetectorRef) {
    this.localStream = { id: '', stream: null };
  }

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream: MediaStream) => {
          console.log('Get local stream success!');

          this.localStream = {
            ...this.localStream,
            stream,
          };
        })
        .catch(err => {
          console.log('Failed to get stream', err);
        });

    const peerOptions: Peer.PeerJSOption = {
      host: 'localhost',
      port: 9000,
      path: '/peerjs',
      secure: false,
      debug: 2
    };

    this.peer = new Peer(peerOptions);

    this.peer.on('open', (id) => {
      this.localStream = { ...this.localStream, id };
      console.log('localStream id: ', id);
    });

    this.peer.on('disconnected', () => {
      console.log('Disconnnect from PeerServer.');
    });

    this.peer.on('error', (err) => {
      console.error('An error occurs : ' , err.type);
      alert('An error occurs : ' + err.type);
    });

    this.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(data);
      });
    });

    this.peer.on('call', (call: Peer.MediaConnection) => {
      call.answer(this.localStream.stream);
      call.on('stream', (stream: MediaStream) => {
        console.log('Get answer remote video successed! id: ', call.peer);
        console.log('Open : ', call.open);

        const existStream = this.remoteStreamArray.find((item) => {
          if (item.id === call.peer) {
            return true;
          }
        });

        if (existStream) { return ; }

        this.remoteStreamArray = [...this.remoteStreamArray, {id: call.peer, stream}];
        this.cd.markForCheck();
        this.cd.detectChanges();
      });

      call.on('close', () => {
        console.log('Peer close the connection!');
      });

      call.on('error', (err) => {
        console.log('Something error occurs!', JSON.stringify(err));
      });
    });
  }

  connectRemote() {
    const call: Peer.MediaConnection = this.peer.call(this.inputValue, this.localStream.stream);
    call.on('stream', (remoteStream: MediaStream) => {
      console.log('Get call remote video successed! id: ', call.peer);
      console.log('Open : ', call.open);

      const existStream = this.remoteStreamArray.find((item) => {
        if (item.id === call.peer) {
          return true;
        }
      });

      if (existStream) { return ; }

      this.remoteStreamArray = [...this.remoteStreamArray, {id: call.peer, stream: remoteStream }];
      this.cd.markForCheck();
      this.cd.detectChanges();
    });
    call.on('close', () => {
      console.log('Peer close the connection!');
    });

    call.on('error', err => {
      console.log('Something error occurs!', JSON.stringify(err));
    });
  }
}
