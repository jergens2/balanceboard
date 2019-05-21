import { Component, OnInit } from '@angular/core';
import { Task } from '../../task/task.model';

@Component({
  selector: 'app-eisenhower-view',
  templateUrl: './eisenhower-view.component.html',
  styleUrls: ['./eisenhower-view.component.css']
})
export class EisenhowerViewComponent implements OnInit {

  constructor() { }

  private _allTasks: Task[] = [];

  ngOnInit() {
  }

}
