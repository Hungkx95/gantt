import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as Moment from 'moment';
import { formatDate } from '@angular/common';
import { Task } from '../model/Task';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  moment = Moment;
  search = '';
  charts: Array<Task>;
  storageKey = 'charts';

  constructor(private router: Router) { }

  ngOnInit() {
    const store = localStorage.getItem('charts');
    if (store) {
      this.charts = JSON.parse(store);
    } else {
      this.charts = [];
      localStorage.setItem('charts', JSON.stringify(this.charts));
    }
    // format dates
    this.charts.forEach((chart) => {
    //  chart.duration = ((new Date(chart.dates.end).getTime() - new Date(chart.dates.start).getTime()) / 86400000) + 1;
      chart.plan_start_date = formatDate(new Date( chart.plan_start_date), 'MM/dd/yyyy', 'en-US');
      chart.plan_end_date = formatDate(new Date( chart.plan_end_date), 'MM/dd/yyyy', 'en-US');

    });
  }

  createChart() {
    const plan_start_date = this.moment().format('MM/DD/YYYY');
    const plan_end_date = this.moment().add(7, 'days').format('MM/DD/YYYY');
    const chart = {
      id:this.charts.length,
      title: 'New Projectx',
      plan_start_date,
      plan_end_date,
      tasks:[]
    } as Task;
    this.charts.push(chart);
    this.router.navigate(['charts', this.charts.indexOf(chart)]); // navigate to new chart
  }

  deleteChart(i: number) {
    if (confirm('Delete this chart?')) {
      const charts = JSON.parse(localStorage.getItem(this.storageKey));
      charts.splice(i, 1); // remove specific chart from array
      localStorage.setItem(this.storageKey, JSON.stringify(charts)); // save to storage
      this.charts.splice(i, 1); // udpate chart display
    }
  }

}
