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
  public roomId = '';
  localCandi = '';
  peerCandidatas: Candidate[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {
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

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const reqUrl = `/joinroom/?room=${roomId}&candi=${candi}`;
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
