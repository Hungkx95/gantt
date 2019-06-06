export class Task{
    company:string;
    project_code:string;
    parent_id:number;
    id:number;
    title:string;
    emp_id:string;
    phase:string;
    plan_start_date:string;
    plan_end_date:string;
    actual_start_date:string;
    actual_end_date:string;
    progressDates: string[];
    point:number;
    wk_est:number;
    wk_plan:number;
    wk_act:number;
    progress_plan:number;
    progress_act:number;
    change_count:number;
    create_emp_id:string;
    create_datetime:string;
    change_emp_id:string;
    change_datetime:string;
    data_flag:string;
    expanded: boolean; 
    tasks:Task[]
}