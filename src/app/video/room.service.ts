import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

export interface Candidate {
  id: string;
  refIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  roomId = 'wa89sdt56kll48';
  localCandi = '';
  peerCandidatas: Candidate[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.localCandi = this.getLocalCandiId();

    this.roomId = this.route.snapshot.paramMap.get('roomid') || this.roomId;
    console.log(`Room id: ${this.roomId}`);
  }

  joinRoom(candi: string, roomId?: string) {
    if (!roomId) {
      roomId = this.roomId;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        'Access-Control-Allow-Credentials': 'true'
      })
    };
   // const reqUrl = `/joinroom/?room=${roomId}&candi=${candi}`;
    const reqUrl = `http://localhost:9000/joinroom/?room=${roomId}&candi=${candi}`;
    return this.http.get<Candidate[]>(reqUrl, httpOptions);
  }

  leaveRoom(candi: string, roomId?: string, from?: string) {
    if (!roomId) {
      roomId = this.roomId;
    }
    if (!from) {
      from = this.localCandi;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      })
    };
    const reqUrl = `http://localhost:9000/leaveroom/?room=${roomId}&candi=${candi}&from=${from}`;
   // const reqUrl = `/leaveroom/?room=${roomId}&candi=${candi}&from=${from}`;
    return this.http.get(reqUrl, httpOptions);
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
