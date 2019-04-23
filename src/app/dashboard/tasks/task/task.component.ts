import { Component, OnInit, Input } from '@angular/core';
import { Task } from '../task.model';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  constructor() { }

  faTimes = faTimes;


  @Input() task: Task;

  ngOnInit() {
  }


  onMouseEnter(){
    this.ifMouseOver = true;
  }
  onMouseLeave(){
    this.ifMouseOver = false;
  }
  ifMouseOver: boolean = false;

}
