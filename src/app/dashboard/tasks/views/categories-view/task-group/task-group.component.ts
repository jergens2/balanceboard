import { Component, OnInit, Input } from '@angular/core';
import { TaskGroup } from './task-group.class';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.css']
})
export class TaskGroupComponent implements OnInit {


  @Input() taskGroup: TaskGroup;

  constructor() { }

  ngOnInit() {
  }

}
