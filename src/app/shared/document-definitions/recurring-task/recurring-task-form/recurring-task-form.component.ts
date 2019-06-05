import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalService } from '../../../../modal/modal.service';
import { RecurringTasksService } from '../../../../dashboard/scheduling/recurring-tasks/recurring-tasks.service';
import { RecurringTaskRepitition } from './rt-repititions/recurring-task-repitition.interface';
import { RecurringTaskDefinition } from '../recurring-task-definition.class';

@Component({
  selector: 'app-recurring-task-form',
  templateUrl: './recurring-task-form.component.html',
  styleUrls: ['./recurring-task-form.component.css']
})
export class RecurringTaskFormComponent implements OnInit {

  constructor(private modalService: ModalService, private recurringTaskService: RecurringTasksService) { }

  recurringTaskForm: FormGroup;
  repititions: RecurringTaskRepitition[] = [];

  ngOnInit() {
    this.recurringTaskForm = new FormGroup({
      "name":new FormControl("", Validators.required),
    });
  }

  onRepititionsValueChanged(repititions: RecurringTaskRepitition[]){
    this.repititions = repititions;
  }

  onClickSave(){
    let name: string = this.recurringTaskForm.controls["name"].value;
    let saveTask: RecurringTaskDefinition = new RecurringTaskDefinition("", "", name, this.repititions);
    console.log("Saving this task", saveTask)
    this.recurringTaskService.saveRecurringTaskDefinition(saveTask);
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
