import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../config/config.service';

export interface Candidate {
  id: string;
  refIds: string[];
}

export enum RULER {
  TEACHER = 0,
  STUDENT,
  ASSISTANT,
  AUDIENCE,
  UNKNOWN
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  public roomId = '';
  localCandi = '';
  peerCandidatas: Candidate[] = [];
  ruler: RULER = RULER.UNKNOWN;

  constructor(private http: HttpClient, private cf: ConfigService) {
    this.localCandi = this.getLocalCandiId();
  }

  joinRoom(candi: string, roomId?: string) {
    if (!roomId) {
      roomId = this.roomId;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      })
    };

    const config = this.cf.peerConfig;
    const hostname = window.location.hostname;
    const protocol = this.cf.peerConfig.secure === true ? 'https' : 'http';
    console.log(`hostname: ${hostname} , protocol: ${protocol}`);

    const reqUrl = `https://${hostname}:${config.port}/joinroom/?room=${roomId}&candi=${candi}`;
    return this.http.get<Candidate[]>(reqUrl, httpOptions);
  }

  setLocalCandiId( candiId ) {
    const ws = window.sessionStorage;
    this.localCandi = candiId;
    ws.setItem('letslesson.video.room.candidate.id', this.localCandi);
  }

  getLocalCandiId() {
    const ws = window.sessionStorage;
    return ws.getItem('letslesson.video.room.candidate.id');
  }
}
