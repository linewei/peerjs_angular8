import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Candidate {
  id: string;
  refIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  public roomId = 'wa89sdt56kll48';
  localCandi = '';
  peerCandidatas: Candidate[] = [];

  constructor(private http: HttpClient) {
    this.localCandi = this.getLocalCandiId();
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
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        'Access-Control-Allow-Credentials': 'true'
      })
    };
    const reqUrl = `http://localhost:9000/leaveroom/?room=${roomId}&candi=${candi}&from=${from}`;
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
