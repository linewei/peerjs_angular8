import { Component, OnInit } from '@angular/core';
import { StreamInterface, VideoService } from './video.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService, RULER } from './room.service';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  constructor(
    public vs: VideoService,
    private route: ActivatedRoute,
    private rs: RoomService,
    private cf: ConfigService
    ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((param) => {
      const classid = param.get('class');
      const ruler = +param.get('ruler');
      if ( ! classid ) {
        return;
      }
      if ( ! ruler ) {
        return;
      }

      this.rs.roomId = classid;
      this.rs.ruler = ruler as RULER;

      console.log(`roomid: ${this.rs.roomId}, ruler: ${this.rs.ruler}`);

      this.initLocalStream();
    });
  }

  initLocalStream() {
    const videoConfig = this.cf.videoConfig;
    navigator.mediaDevices.getUserMedia(videoConfig)
        .then((stream: MediaStream) => {
          console.log('Get local stream success!');
          this.vs.setupPeer(stream);

          stream.getVideoTracks().map((track, index) => {
            console.log(`${index} setting: ${JSON.stringify(track.getSettings())}`);
          });
        })
        .catch(err => {
          console.log('Failed to get stream', err);
        });
  }

  trackByStream(index: number, item: StreamInterface) {
    return item.id;
  }
}
