import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';
import { TreeComponent } from './tree/tree.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { GridComponent } from './grid/grid.component';
import { VideoComponent } from './video/video.component';


const routes: Routes = [
  {path: 'nav/dashboard', component: DashboardComponent},
  {path: 'nav/form', component: FormComponent},
  {path: 'table', component: TableComponent},
  {path: 'tree', component: TreeComponent},
  {path: 'drap-drop', component: DragDropComponent},
  {path: 'grid', component: GridComponent},
  {path: 'video', component: VideoComponent},
  {path: '', component: DashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
