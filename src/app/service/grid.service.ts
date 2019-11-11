import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  gridNumArray = [1, 2];
  gridNum = 2;

  constructor() { }

  addGrid() {
    this.gridNumArray.push(++this.gridNum);
  }

  subGrid() {
    this.gridNumArray = this.gridNumArray.filter(value => value !== this.gridNum);
    this.gridNum--;
  }
}
