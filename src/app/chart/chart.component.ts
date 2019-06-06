import { Component, OnInit, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResizeEvent } from 'angular-resizable-element';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Observable, of } from 'rxjs';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { InforComponent } from '../infor/infor.component';
import { Task } from '../model/Task';
import { TaskFlatNode } from '../model/taskFlatNode';
import { computeStyle } from '@angular/animations/browser/src/util';

@Injectable()
export class ChartDatabase {
  // database
  id; // chart id
  moment = moment;
  dataChange = new BehaviorSubject<Task>(null);
  storageKey = 'charts';

  get data(): Task { return this.dataChange.value; }

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.initialize();
    });
    this.dataChange.asObservable().subscribe(val => {
      this.saveStorage(val);
    });
  }
  saveWithNoParam(){
    this.saveStorage(this.data);
  }
  saveParentID(node:Task,parentID){
    console.log(node)
    console.log(node.parent_id+"-"+parentID)
    node.parent_id=parentID;
    console.log(node)
    this.saveStorage(this.data);
    console.log('updated');
  }
  // load local data
  loadStorage() {
    const charts = localStorage.getItem(this.storageKey);
    return JSON.parse(charts);
  }
  getProjectByID(idProject){
    const charts =JSON.parse( localStorage.getItem(this.storageKey)); 
    let result;
    charts.forEach(project => {
      if(project.id==idProject)  result= project; 
    });
  return result;
  }
  // trản về task dựa vòa id project và id task 
  getTaskByID(idProject,idTask){
    // console.log(idProject+"*"+idTask)
    const charts =JSON.parse( localStorage.getItem(this.storageKey)); 
    let result:any;
    charts.forEach(project => {
      if(project.id===idProject) {
      //  console.log(project);
        project.tasks.forEach(task => {
          if(task.id===idTask)result=task;
        });
      };
    }); 
    return result
  }
  // save local data
  saveStorage(val) {
    const charts = JSON.parse(localStorage.getItem(this.storageKey)) as Array<Task>;
    charts[this.id] = val;
    localStorage.setItem(this.storageKey, JSON.stringify(charts));
  }

  initialize() {
    const charts = this.loadStorage(); // load storage of charts
    if (charts && charts.length && charts[this.id]) {
      const tree = this.buildTree([charts[this.id]], 0); // build tree
      this.dataChange.next(tree[0]); // broadcast data
    } else {
      // init a new project
      const plan_start_date = moment().format('YYYY-MM-DD');
      const plan_end_date = moment().add(10, 'days').format('YYYY-MM-DD');
      const  days = ((new Date(plan_end_date).getTime() - new Date(plan_start_date).getTime()) / 86400000) + 1;
      const root = {
        company:'AIT',
        project_code:'AIT-Project-'+charts.length,
        parent_id:null,
        id:charts.length,
        title: 'Project'+charts.length,
        emp_id: 'NV001',
        phase:'',
        plan_start_date,
        plan_end_date,
        actual_start_date:'',
        actual_end_date:'',
        progressDates:[],
        point:null,
        wk_est:days*8,
        wk_plan:null,
        wk_act:null,
        progress_plan:null,
        progress_act:null,
        change_count:0,
        create_emp_id:'',
        create_datetime:moment().format('YYYY-MM-DD'),
        change_emp_id:'',
        change_datetime:'',
        data_flag:'active',
        expanded: true,
        tasks:[]     
      };
      const tree = this.buildTree([root], 0); // build tree
      this.dataChange.next(tree[0]); // broadcast data
    }
  }

  buildTree(Tasks: Array<any>, level: number): Task[] {
    return Tasks.map((task: Task) => {
      const newTask = new Task();
      newTask.company=task.company;
      newTask.project_code=task.project_code;
      newTask.parent_id=task.parent_id;
      newTask.id=task.id;
      newTask.title = task.title;
      newTask.emp_id = task.emp_id;
      newTask.phase=task.phase;
      newTask.plan_start_date = task.plan_start_date;
      newTask.plan_end_date = task.plan_end_date;
      newTask.actual_start_date=task.actual_start_date;
      newTask.actual_end_date=task.actual_end_date;
      newTask.progressDates = this.setProgressDates(task.plan_start_date,task.plan_end_date);
      newTask.point=task.point;
      newTask.wk_est=task.wk_est;
      newTask.wk_plan=task.wk_plan;
      newTask.wk_act=task.wk_act;
      newTask.progress_plan=task.progress_plan;
      newTask.progress_act=task.progress_act;
      newTask.change_count = task.change_count;
      newTask.create_emp_id=task.create_emp_id;
      newTask.create_datetime=task.create_datetime;
      newTask.change_emp_id=task.change_emp_id;
      newTask.change_datetime=task.change_datetime;
      newTask.data_flag=task.data_flag;    
      newTask.expanded = task.expanded !== undefined ? task.expanded : true;
      if (task.tasks.length) {
        newTask.tasks = this.buildTree(task.tasks, level + 1);
      } else {
        newTask.tasks = [];
      }
      return newTask;
    });
  }


  /** step manipulations */
  // update step name
  updateStepName(node: Task, name: string) {
    node.title = name;
    // do not update tree, otherwise will interupt the typing
    this.saveStorage(this.data);
    console.log('StepName updated');
  }

  updateAssigneeName(node: Task, assignee: string) {
    node.emp_id = assignee;
    this.saveStorage(this.data);
    console.log('AssigneeName update');
  }

  // add child step
  addChildStep(parent: Task) {
    parent.expanded = true; // set parent node expanded to show children
    const child = new Task();
    child.company=parent.company;
    child.project_code=parent.project_code;
    child.id=parent.tasks.length;
    child.parent_id=null;
    child.title = '#Task '+parent.tasks.length;
    child.emp_id='';
    child.phase='';
    child.plan_start_date= parent.plan_start_date;
    child.plan_end_date=parent.plan_end_date;
    child.actual_start_date='';
    child.actual_end_date='';
    child.progressDates=parent.progressDates;
    child.point=null;
    child.wk_est=parent.wk_est;
    child.wk_plan=null;
    child.wk_act=null;
    child.progress_plan=null;
    child.progress_act=null;
    child.change_count=0;
    child.create_emp_id='';
    child.create_datetime=moment().format('YYYY-MM-DD');
    child.change_emp_id='';
    child.change_datetime='';
    child.data_flag='active';
    child.expanded=true;
    child.tasks = [];
    parent.tasks.push(child);
    this.dataChange.next(this.data);
    console.log('Add ChildStep');
  }

  // delete step
  deleteStep(parent: Task, child: Task) {
    const childIndex = parent.tasks.indexOf(child);
    parent.tasks.splice(childIndex, 1);
    this.dataChange.next(this.data);
    console.log('Delete Step ');
  }

  // toggle expanded
  toggleExpaned(task: Task) {
    task.expanded = !task.expanded;
    this.saveStorage(this.data);
    console.log('toggleExpaned');
  }

  // // update progress
  updateProgress(task: Task,start:string,end:string) {
   // step.progress = progress;
    task.progressDates = this.setProgressDates(start,end);
    this.saveStorage(this.data);
    console.log('Progress updated');
    // instead of refreshing whole tree, return progress dates and update the step only
    return task.progressDates;
  }

  // update progress dates
  setProgressDates(start:string,end:string) {
    const start1 = this.moment(start);
    const end1 = this.moment(end);
    const range = moment.range(start1, end1);
    const numDays = Math.round(Array.from(range.by('days')).length);
    const totalDays = Array.from(range.by('days')).map(d => d.format('YYYY-MM-DD')); // all days in string array
  
    return totalDays.splice(0, numDays); // start from 0, get the first len days
    
  }
  //update estimate
  updateEstimate(node: Task,est:number){
    if(est!==null&&est>0){
      node.wk_est=est;
      const  duration = (((new Date(node.plan_end_date).getTime() - new Date(node.plan_start_date).getTime()) / 86400000) + 1)*8;
      let days=(est-duration)/8;
      if(days>0){
        days=Math.ceil(days);
        node.plan_end_date=moment(node.plan_end_date).add(days, 'days').format('YYYY-MM-DD');    
      }
      if(days<0){
        days=Math.ceil(days);
        node.plan_end_date=moment(node.plan_end_date).add(days, 'days').format('YYYY-MM-DD');
      }   
      node.progressDates = this.setProgressDates(node.plan_start_date,node.plan_end_date);
      this.saveStorage(this.data); 
      this.dataChange.next(this.data);
      return node.progressDates;
    }
    else console.log("Something wrong!");
  }
  //update date range
  updateDateRange(task: Task,start:string,end:string) {
  //  console.log(this.data);
  // //cach save binh thuong
  //   const charts = JSON.parse(localStorage.getItem(this.storageKey)) as Array<Task>;
  //   charts[0].tasks[task.id]=task;
  //   localStorage.setItem(this.storageKey, JSON.stringify(charts));
  //end
    task.plan_start_date=start;
    task.plan_end_date=end;
    const  est = (((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1)*8 ;
    task.wk_est=est;
    task.progressDates = this.setProgressDates(start,end);
    this.saveStorage(this.data);
    console.log('DateRange updated');
    // instead of refreshing whole tree, return progress dates and update the step only
    this.dataChange.next(this.data);
    return task.progressDates;
  }
  // updateDateRange2(task: Task,start:string,end:string) {
  //     task.progressDates = this.setProgressDates(start,end);
  //     task.plan_start_date=start;
  //     task.plan_end_date=end;
  //     const charts = JSON.parse(localStorage.getItem(this.storageKey)) as Array<Task>;
  //     charts[0].tasks[task.id]=task;
  //     localStorage.setItem(this.storageKey, JSON.stringify(charts));
  //   console.log(this.data);
  //   //  this.dataChange.next(this.data);
  //     return task.progressDates;
  //   }

}















@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [ChartDatabase]
})
export class ChartComponent implements OnInit {
  id;
  moment = moment;
  dates: string[] = []; // all days in chart
  today = moment().format('YYYY-MM-DD');
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap: Map<TaskFlatNode, Task> = new Map<TaskFlatNode, Task>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap: Map<Task, TaskFlatNode> = new Map<Task, TaskFlatNode>();
  treeControl: FlatTreeControl<TaskFlatNode>;
  treeFlattener: MatTreeFlattener<Task, TaskFlatNode>;
  dataSource: MatTreeFlatDataSource<Task, TaskFlatNode>;
  chartData;
  a;

  sidebarStyle = {};
  listAssignee: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  abc = this.listAssignee[1];

  constructor(
  
    private database: ChartDatabase,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private route: ActivatedRoute
    ) {
      this.route.params.subscribe(params => {this.id = params.id;});
      this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel, this._isExpandable, this._getChildren);
      this.treeControl = new FlatTreeControl<TaskFlatNode>(this._getLevel, this._isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe((tree: Task) => {
      if (tree) {
        this.chartData = tree;
        this.dataSource.data = [tree];
        this.buildCalendar(tree,tree.plan_start_date,tree.plan_end_date); /** expand tree based on status */
        this.treeControl.dataNodes.forEach(node => {
          if (node.expanded) {
            this.treeControl.expand(node);
          } else {
            this.treeControl.collapse(node);
          }
        });
      }
    });
  }


  /** utils of building tree */
  transformer = (node: Task, level: number) => {
    // tslint:disable-next-line: max-line-length
    const flatNode = new TaskFlatNode(
      node.company,
      node.project_code,
      node.parent_id,
      node.id,
      level,
      node.title,
      node.emp_id,
      node.phase,
      node.plan_start_date,
      node.plan_end_date,
      node.actual_start_date,
      node.actual_end_date,
      node.progressDates,
      node.point,
      node.wk_est,
      node.wk_plan,
      node.wk_act,
      node.progress_plan,
      node.progress_act,
      node.change_count,
      node.create_emp_id,
      node.create_datetime,
      node.change_emp_id,
      node.change_datetime,
      node.data_flag,
      node.expanded,
      !!node.tasks.length);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  // tslint:disable-next-line: variable-name
  private _getLevel = (node: TaskFlatNode) => node.level;
  // tslint:disable-next-line: variable-name
  private _isExpandable = (node: TaskFlatNode) => node.expandable;
  // tslint:disable-next-line: variable-name
  private _getChildren = (node: Task): Observable<Task[]> => of(node.tasks);
  // tslint:disable-next-line: variable-name
  hasChild = (_: number, _nodeData: TaskFlatNode) => _nodeData.expandable;
  /** end of utils of building tree */
  ngOnInit() {
  // console.log(this.database.getTaskByID(0,1));
    // console.log(this.database.getTaskByID(1,1))
  }

  /** tree nodes manipulations */
  updateStepName(node: TaskFlatNode, name: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateStepName(nestedNode, name);
    this.toastr.success('Successfully', 'Update Step Name');
  }

  updateAssignee(node: TaskFlatNode, event) {
   // console.log(event.value);
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateAssigneeName(nestedNode, event.value);
    this.toastr.success('Successfully', 'Update Assignee Name');
  }

  addChildStep(node: TaskFlatNode) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.addChildStep(nestedNode);
    this.toastr.success('Successfully', 'Add New Child');
  }

  deleteStep(node: TaskFlatNode) {
    // if root, ignore
    if (confirm('Delete this step')) {
      if (this.treeControl.getLevel(node) < 1) {
        return null;
      }
    
    const parentFlatNode = this.getParentStep(node);
    const parentNode = this.flatNodeMap.get(parentFlatNode);
    const childNode = this.flatNodeMap.get(node);
    this.database.deleteStep(parentNode, childNode);
    this.toastr.warning('Successfully', 'Delete Step');
    }
  }
  getTaskByID(idProject,idTask){
    this.database.getTaskByID(idProject,idTask);
  }
  getParentStep(node: TaskFlatNode) {
    // let a;
    // console.log(node.parent_id);
    // if(node.parent_id===1){ 
    //  // console.log(node.parent_id);
    //   a= this.database.getTaskByID(this.id,node.parent_id);
    // }
    //console.log(node)
    const { treeControl } = this;
    const currentLevel = treeControl.getLevel(node);
    // if root, ignore
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = treeControl.dataNodes.indexOf(node) - 1;
    // loop back to find the nearest upper node
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = treeControl.dataNodes[i];
      if (treeControl.getLevel(currentNode) < currentLevel) {
     //   console.log(currentNode)
        return currentNode;
      }
    }
  }

  toggleExpanded(node: TaskFlatNode) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.toggleExpaned(nestedNode);
  }

  // updateProgress(node: TaskFlatNode, progress: number) {
  //   const nestedNode = this.flatNodeMap.get(node);
  //   const newProgressDates = this.database.updateProgress(nestedNode, progress);
  //   node.progressDates = newProgressDates;
  // }

  
  updateDateRange(node,start,end) {
    console.log(start+" - "+end)
    start = this.moment(start).format('YYYY-MM-DD'); // convert moment to string
    end = this.moment(end).format('YYYY-MM-DD'); // convert moment to string
    const nestedNode = this.flatNodeMap.get(node);
    console.log(node);
    console.log(nestedNode); 
    /** rebuild calendar if the root is updated */
    if (node.level === 0) {
      this.buildCalendar(nestedNode,start,end);
    }
    /** update progress dates */
    const newProgressDates = this.database.updateDateRange(nestedNode,start,end);
    node.progressDates = newProgressDates;


    //  không dc xóa khối này
    
    // kiem tra xem no có tự đặt parentid là chính nó hay ko
    // if(node.id!==node.parent_id){
    //   let project= this.database.getProjectByID(this.id);
    //   let listTask =[];
    //   project.tasks.forEach(task => {
    //     if(task.parent_id==node.id) {
    //       listTask.push(task);
    //     }
    //   });
    //   //console.log(listTask);
    //   if(listTask.length!==0){
    //     listTask.forEach(task => {
    //       console.log(nestedNode);
    //       const  days = ((new Date(task.plan_end_date).getTime() - new Date(task.plan_start_date).getTime()) / 86400000);
    //       let taskStart=moment(nestedNode.plan_end_date).add(1, 'days').format('YYYY-MM-DD');
    //       let taskEnd=moment(taskStart).add(days,'days').format('YYYY-MM-DD');
    //       this.updateDateRange(this.transformer(task,1),taskStart,taskEnd);
    //     });
    //   }
    // }
    
  }
  /** resize and validate */
  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX = 200;
    if (
      event.rectangle.width &&
      (event.rectangle.width < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent): void {
    this.sidebarStyle = {
      width: `${event.rectangle.width}px`
    };
  }

  buildCalendar(task: Task,start,end) {
    // const start = this.moment(task.plan_start_date);
    // const end = this.moment(task.plan_end_date);
    // console.log(task.plan_start_date);
    // console.log(start);
    task.plan_start_date=start;
    task.plan_end_date=end;
    const range = this.moment.range(start, end);
    const days = Array.from(range.by('days'));
    this.dates = days.map(d => d.format('YYYY-MM-DD'));
    
  }
  estimateChange(node:TaskFlatNode, est:number){
    const nestedNode = this.flatNodeMap.get(node);
    const newProgressDates =this.database.updateEstimate(nestedNode,est);
    node.progressDates = newProgressDates;
    // if(est!==null&&est>0){
    //   const  duration = (((new Date(node.plan_end_date).getTime() - new Date(node.plan_start_date).getTime()) / 86400000) + 1)*8;
    //   let days=(est-duration)/8;
    //   if(days>0){
    //     days=Math.ceil(days);
    //     node.plan_end_date=moment(node.plan_end_date).add(days, 'days').format('YYYY-MM-DD');    
    //   }
    //   if(days<0){
    //     days=Math.ceil(days);
    //     node.plan_end_date=moment(node.plan_end_date).add(days, 'days').format('YYYY-MM-DD');
    //   }
    //  ;
    // }
    // else node.wk_est=null;

  }
  changeDate(node,date){  
    ///console.log(node);
    if(date<node.plan_start_date){
      node.plan_start_date=date;
      this.updateDateRange(node,node.plan_start_date,node.plan_end_date);    
    }
    if(date>node.plan_end_date){
      node.plan_end_date=date;
      this.updateDateRange(node,node.plan_start_date,node.plan_end_date);
    }
    if(date>node.plan_start_date&&date<node.plan_end_date){
      node.plan_end_date=date;
      this.updateDateRange(node,node.plan_start_date,node.plan_end_date);
    }
  }
  changeStartDate(node,date){
    node.plan_start_date=date;
    this.updateDateRange(node,node.plan_start_date,node.plan_end_date);
  }
  showInfor(node){
    const dialogRef = this.dialog.open(InforComponent, {
      width: 'auto',
      data:{
        node:node,
        IDProject:this.id
      }
   
    },);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      const nestedNode = this.flatNodeMap.get(node);
      this.database.saveParentID(nestedNode,node.parent_id);
      this.updateDateRange(node,node.plan_start_date,node.plan_end_date);
     
    });
  }
  tooltip(node,date){
    if(date>=node.plan_start_date&&date<=node.plan_end_date){
      let emName=this.listAssignee.filter(s=>s==node.emp_id);
      return node.title+'\nFrom: '
      +node.plan_start_date+'\nTo    : '
      +node.plan_end_date+'\nEstimate: '
      +node.wk_est +'h\nAssignee: '
      +emName;
    }
    //date>=node.plan_start_date&&date<=node.plan_end_date ? (node.title+'&#013;From : '+node.plan_start_date+'&#013;To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: '+node.plan_end_date+'&#013;Estimate(h):'+node.) : null"   
  }




  drop(event: CdkDragDrop<string[]>) {

    this.a = (this.database.data.tasks);
    moveItemInArray(this.a, event.previousIndex, event.currentIndex);
    this.database.dataChange.subscribe((tree: Task) => {
      if (tree) {
        this.chartData = tree;
        this.dataSource.data = [tree];
        this.buildCalendar(tree,tree.plan_start_date,tree.plan_end_date); /** expand tree based on status */
        this.treeControl.dataNodes.forEach(node => {
          if (node.expanded) {
            this.treeControl.expand(node);
          } else {
            this.treeControl.collapse(node);
          }
        });
      }
     this.database.saveWithNoParam();
    });
  }
}
