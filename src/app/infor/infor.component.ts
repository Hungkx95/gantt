import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskFlatNode } from '../model/taskFlatNode';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
@Component({
  selector: 'app-infor',
  templateUrl: './infor.component.html',
  styleUrls: ['./infor.component.css']
})
export class InforComponent implements OnInit {
  dataSource;
  project:TaskFlatNode[];
  dataForCancel:TaskFlatNode;
  parent_id;
  moment = moment;
  public data: TaskFlatNode;
  public IDProject:number;
  constructor( public dialogRef: MatDialogRef<InforComponent>,
    @Inject(MAT_DIALOG_DATA) data) { // nhận dât truyền vào
      this.data=data.node;
      this.IDProject=data.IDProject;
    }

  ngOnInit() {
    this.dataSource= JSON.parse(localStorage.getItem('charts'));// lấy dât ra 
    this.project=this.dataSource[this.IDProject].tasks;
     this.parent_id=this.data.parent_id;
    this.project.forEach(task => {
   // console.log(this.data.id+"-"+task.parent_id+"/"+this.data.parent_id+"-"+task.id)
      if(task.parent_id===this.data.id&&this.data.parent_id===task.id) {
        this.deleteMsg(task);
      }
    });
  }

  
  Cancel(){
    this.dialogRef.close();
  }
  deleteMsg(task) {
    const index: number = this.project.indexOf(task);
    if (index !== -1) {
        this.project.splice(index, 1);
    }        
}
change(){
  this.project.forEach(task => {
   // console.log(this.data.id+"-"+task.parent_id+"/"+this.parent_id+"-"+task.id)
   if(task.parent_id===this.data.id&&this.parent_id===task.id) {
    this.parent_id=null;
    console.log("Can't set parent_id is its child id");
    
 }
 });
}
  // thay đổi task cha
  changeParent(){
    if(this.parent_id!==undefined){ 
      const  days = ((new Date(this.data.plan_end_date).getTime() - new Date(this.data.plan_start_date).getTime()) / 86400000) + 1;
      this.data.parent_id=this.parent_id;
      const selectedtask=this.dataSource[this.IDProject].tasks.filter(s=>s.id===this.parent_id);
      this.data.plan_start_date=moment(selectedtask[0].plan_end_date).add(1, 'days').format('YYYY-MM-DD');
      this.data.plan_end_date=moment(selectedtask[0].plan_end_date).add(days, 'days').format('YYYY-MM-DD');
    
    }
    else{//ko thiet lap task cha
      this.data.parent_id=null;
    }
    this.dialogRef.close();
}
}
