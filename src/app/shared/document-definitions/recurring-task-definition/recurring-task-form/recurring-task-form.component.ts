import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalService } from '../../../../modal/modal.service';
// import { RecurringTasksService } from '../../../../dashboard/activities/routines/routine-definition/api/routine-definition.service';
import { RecurringTaskRepitition } from './rt-repititions/recurring-task-repitition.interface';
import { RecurringTaskDefinition } from '../recurring-task-definition.class';

@Component({
  selector: 'app-recurring-task-form',
  templateUrl: './recurring-task-form.component.html',
  styleUrls: ['./recurring-task-form.component.css']
})
export class RecurringTaskFormComponent implements OnInit {

  constructor(private modalService: ModalService) { }

  recurringTaskForm: FormGroup;
  repititions: RecurringTaskRepitition[] = [];
  updateRepititions: RecurringTaskRepitition[] = [];

  @Input() updateTask: RecurringTaskDefinition;

  ngOnInit() {
    if(this.updateTask){
      this.updateRepititions = this.updateTask.repititions;
      this.recurringTaskForm = new FormGroup({
        "name":new FormControl(this.updateTask.name, Validators.required),
      });
      // this.repititions = this.updateTask.repititions;
    }else{
      this.recurringTaskForm = new FormGroup({
        "name":new FormControl("", Validators.required),
      });
    }

  }

  onRepititionsValueChanged(repititions: RecurringTaskRepitition[]){
    this.repititions = repititions;
  }

  onClickSave(){
    if(this.updateTask){
      let name: string = this.recurringTaskForm.controls["name"].value;
      this.updateTask.name = name;
      this.updateTask.groupIds = [];
      this.updateTask.activityTreeId = "";
      this.updateTask.repititions = this.repititions;
      // this.recurringTaskService.httpUpdateRecurringTaskDefinition(this.updateTask);
    }else{
      let name: string = this.recurringTaskForm.controls["name"].value;
      // let saveTask: RecurringTaskDefinition = new RecurringTaskDefinition("", this.recurringTaskService.userId, name, this.repititions);
      // saveTask.groupIds = [];
      // saveTask.activityTreeId = "";
      // this.recurringTaskService.httpSaveRecurringTaskDefinition(saveTask);
    }

    this.modalService.closeModal();
  }
  onClickCancel(){
    this.modalService.closeModal();
  }

  public get disabled(): string{
    if(this.recurringTaskForm.invalid || this.repititions.length < 1){
      return "disabled";
    }else{
      return "";
    }
  }

}
