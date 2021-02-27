import { Component, OnInit } from '@angular/core';
import { TaskHttpService } from './task-http.service';
import { Task } from './task/task.model';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faSitemap, faList, faThLarge, faPercentage } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {


  faPercentage = faPercentage;
  faCog: IconDefinition = faCog;
  faSitemap = faSitemap;
  faList = faList;
  faThlarge = faThLarge;


  constructor(private taskService: TaskHttpService) { }

  private _allTasks: Task[] = [];

  public get allTasks(): Task[]{
    return this._allTasks;
  }

  taskView: string = "CATEGORIES";  // can be "CATEGORIES", "LIST", "GRID", "TREEMAP"

  ngOnInit() {
    this.taskService.tasks$.subscribe((tasks: Task[])=>{

      console.log("UPDATES");
      this._allTasks = tasks;

    })
  }



  onClickChangeView(view: string){
    this.taskView = view;
  }

  settingsMenu: boolean = false;
  onClickSettings(){
    this.settingsMenu = !this.settingsMenu;
  }

}
