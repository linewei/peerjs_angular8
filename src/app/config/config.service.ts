import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public peerConfig: any = {
    host: '/',
    port: 9000,
    path: '/peerjs',
    secure: true,
    debug: 2
  };

  public videoConfig: MediaStreamConstraints = {
    video: {
      width: {min: 640, max: 640},
      height: {min: 360, max: 360},
      frameRate: {min: 20, max: 25},
      aspectRatio: 1.78
    },
    audio: true,
  };

  public webrtcConfig: RTCConfiguration = {

  };

  constructor() { }
}
