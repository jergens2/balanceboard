import { Component, OnInit, Input } from '@angular/core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { TaskGroup } from '../../../task-group/task-group.class';

import { Task } from '../../../task/task.model';
import { ITreeMapItem } from '../treemap/treemap-item.interface';



@Component({
  selector: 'app-treemap-task-group',
  templateUrl: './treemap-task-group.component.html',
  styleUrls: ['./treemap-task-group.component.css']
})
export class TreemapTaskGroupComponent implements OnInit {

  faPlusCircle = faPlusCircle;

  @Input() treeMapValue: ITreeMapItem;

  constructor() { }

  ngOnInit() {
    console.log("Treemap value is ", this.treeMapValue);
  }

  

}
