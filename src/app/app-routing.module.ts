
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChartComponent } from './chart/chart.component';
import { NewhomeComponent } from './newhome/newhome.component';
import { TaskComponent } from './task/task.component';



export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // default path
  { path: 'home', component: HomeComponent },
  { path: 'charts/:id', component: ChartComponent },
  { path: 'newhome' ,component: TaskComponent }

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
