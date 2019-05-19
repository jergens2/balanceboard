import { Component, OnInit } from '@angular/core';

import { ToolsService } from '../../tools.service';
import { ToolComponents } from '../../tool-components.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { faCircle, faCheckCircle, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { Task } from '../../../dashboard/tasks/task/task.model';
import { TaskPriority } from '../../../dashboard/tasks/task/task-priority.enum';
import { TaskService } from '../../../dashboard/tasks/task.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {


  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  constructor(private toolsService: ToolsService, private taskService: TaskService) { }


  taskForm: FormGroup;

  ngOnInit() {
    this.taskForm = new FormGroup({
      "title": new FormControl("", Validators.required),
      "description": new FormControl(""),
      "timeRequiredHours": new FormControl(0),
      "timeRequiredMinutes": new FormControl(0),
      "priority": new FormControl(1),
    })
  }



  onClickSaveTask(){
    let title:string = this.taskForm.controls['title'].value;
    let description: string = this.taskForm.controls['description'].value;

    let task = new Task('', '', title, description);

    let priority: number = this.taskForm.controls['priority'].value as number;
    let taskPriority: TaskPriority;
    if(priority == 0){
      taskPriority = TaskPriority.High;
    }
    if(priority == 1){
      taskPriority = TaskPriority.Normal;
    }
    if(priority == 2){
      taskPriority = TaskPriority.Low;
    }
    task.priority = taskPriority;


    this.taskService.createTaskHTTP$(task).subscribe((savedTask: Task)=>{
      
      console.log("Task has been saved:", task);
    })

    this.toolsService.closeTool(ToolComponents.Todo)
  }
  onClickCloseTask(){
    this.toolsService.closeTool(ToolComponents.Todo)
  }
  public get saveTaskDisabled(): string{
    if(this.taskForm.valid){
      return "";
    }else{
      return "disabled";
    }
  }

  onClickScheduleAutomatic(){
    this.scheduleAutomatic = true;
  }

  onClickScheduleSpecify(){
    this.scheduleAutomatic = false;
  }

  scheduleAutomatic: boolean = true;
  public get scheduleSpecifyIcon(): IconDefinition {
    if(this.scheduleAutomatic){
      return faCircle;
    }else{
      return faCheckCircle;
    }
  }

  public get scheduleAutomaticIcon(): IconDefinition{
    if(this.scheduleAutomatic){
      return faCheckCircle;
    }else{
      return faCircle;
    }
  }


}
