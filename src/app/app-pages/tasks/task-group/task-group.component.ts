import { Component, OnInit, Input } from '@angular/core';
import { TaskGroup } from './task-group.class';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../../../modal/modal.service';
import { Modal } from '../../../modal/modal.class';
import { Task } from '../task/task.model';
import * as moment from 'moment';
import { ModalComponentType } from '../../../modal/modal-component-type.enum';
import { IModalOption } from '../../../modal/modal-option.interface';


@Component({
  selector: 'app-task-group',
  templateUrl: './task-group.component.html',
  styleUrls: ['./task-group.component.css']
})
export class TaskGroupComponent implements OnInit {

  faPlusCircle = faPlusCircle;

  @Input() taskGroup: TaskGroup;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
  }

  onMouseEnter(){
    this.taskGroup.mouseOver = true;
  }

  onMouseLeave(){
    this.taskGroup.mouseOver = false;
  }

  onClickNewTask(){


    let modalData: Task = new Task('', '', "", "", this.taskGroup.directory.fullPath, 1, moment() );
    let modal: Modal = new Modal("Task", null, modalData, null, {}, ModalComponentType.Task);
    modal.action = "GROUP_NEW";
    this.modalService.modalResponse$.subscribe((selectedOption: IModalOption) => {

      console.log("modal response:", selectedOption);
    });
    this.modalService.openModal(modal);
  }

  get squares(): any[] {
    let squares: any[] = [];
    for(let i=0;i<=this.taskGroup.totalTaskCount;i++){
      squares.push(i);
    }
    return squares;

  }

}
