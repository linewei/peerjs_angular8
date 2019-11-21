import { Component, OnInit } from '@angular/core';
import { StreamInterface, VideoService } from './video.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from './room.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.sass']
})
export class VideoComponent implements OnInit {
  constructor(
    public vs: VideoService,
    private route: ActivatedRoute,
    private rs: RoomService
    ) {}

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream: MediaStream) => {
          console.log('Get local stream success!');
          this.vs.setupPeer(stream);
        })
        .catch(err => {
          console.log('Failed to get stream', err);
        });

    this.rs.roomId = this.route.snapshot.paramMap.get('roomid');
    console.log(`Room id: ${this.rs.roomId}`);
  }

  trackByStream(index: number, item: StreamInterface) {
    return item.id;
  }
}
