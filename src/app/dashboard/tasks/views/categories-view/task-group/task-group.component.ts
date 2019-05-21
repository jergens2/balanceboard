import { Component, OnInit, Input } from '@angular/core';
import { ITaskGroup } from './task-group.interface';

@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.css']
})
export class TaskGroupComponent implements OnInit {


  @Input() taskGroup: ITaskGroup;

  constructor() { }

  ngOnInit() {
  }

}
