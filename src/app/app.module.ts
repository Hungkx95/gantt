import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ResizableModule } from 'angular-resizable-element';
import { ChartComponent} from './chart/chart.component';
import { MaterialModule } from './app-material/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AngularDraggableModule } from 'angular2-draggable';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { InforComponent } from './infor/infor.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { TaskComponent } from './task/task.component';
import { NewhomeComponent } from './newhome/newhome.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChartComponent,
    InforComponent,
    TaskComponent,
    NewhomeComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    ResizableModule,
    MaterialModule,
    DragDropModule ,
    AngularDraggableModule,
    CommonModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [InforComponent]
})
export class AppModule { }
