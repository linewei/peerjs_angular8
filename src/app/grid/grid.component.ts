import { Component, OnInit } from '@angular/core';
import { GridService } from '../service/grid.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {

  constructor(private gridService: GridService) { }

  ngOnInit() {
  }

  gridNumArray() {
    return this.gridService.gridNumArray;
  }
  addGrid(): void {
    this.gridService.addGrid();
  }

  subGrid(): void {
    this.gridService.subGrid();
  }
}
