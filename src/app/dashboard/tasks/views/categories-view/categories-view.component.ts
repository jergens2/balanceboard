import { Component, OnInit } from '@angular/core';
import { Task } from '../../task/task.model';
import { TaskService } from '../../task.service';
import { TaskGroup } from '../../task-group/task-group.class';
import { Directory } from '../../../../shared/directory/directory.class';


@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  private _allTasks: Task[] = [];
  public completeTasks: Task[] = [];

  ngOnInit() {
    this._allTasks = this.taskService.tasks;
    this.taskService.tasks$.subscribe((tasks) => {
      this._allTasks = tasks;
      this.completeTasks = Object.assign([], this._allTasks.filter(task=>{ if(!task.isComplete){ return task; }}));


      this.taskGroups = this.buildTaskGroups(this.completeTasks);
    });
  }

  taskGroups: TaskGroup[] = [];


  private buildTaskGroups(tasks: Task[]): TaskGroup[] {

    let taskGroups: TaskGroup[] = [];
    
    for(let task of tasks){
      let groupExists: boolean = false;
      taskGroups.forEach((taskGroup: TaskGroup)=>{
        if(taskGroup.groupName == task.directory.rootDirectory){
          groupExists = true;
          taskGroup.addTask(task);          
        }
      });
      if(!groupExists){
        taskGroups.push(new TaskGroup(task.directory.subPath(0), task));
      }
    }


    let percentages: any[] = [];
    let counts: any[] = [];
    let total: number = 0;
    taskGroups.forEach((taskGroup)=>{
      total += taskGroup.totalTaskCount;
      counts.push({name: taskGroup.groupName, count:taskGroup.totalTaskCount});
    });
    counts.forEach((count)=>{
      percentages.push({name: count.name, percent: ((count.count/total)*100)});
    });
    percentages.sort((p1, p2)=>{
      if(p1.percent > p2.percent){
        return -1;
      }
      if(p1.percent < p2.percent){
        return 1;
      }
      return 0;
    })

    console.log("Percentages:", percentages);

    return taskGroups;
  }

  
}
