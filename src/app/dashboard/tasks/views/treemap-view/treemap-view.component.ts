import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { Task } from '../../task/task.model';
import { TaskService } from '../../task.service';
import { Directory } from '../../../../shared/directory/directory.class';
import { TaskGroup } from '../../task-group/task-group.class';
import { TreeMap } from './treemap/treemap.class';



@Component({
  selector: 'app-treemap-view',
  templateUrl: './treemap-view.component.html',
  styleUrls: ['./treemap-view.component.css']
})
export class TreemapViewComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  private _allTasks: Task[] = [];
  public completeTasks: Task[] = [];
  treeMap: TreeMap;

  taskGroups: TaskGroup[] = [];

  // @ViewChild('treeContainer') treeContainerElement: ElementRef;

  @HostListener('window:resize', ['$event']) onResize(event) {
    console.log("HOSTLISTENER RESIZE:");
    // let height: number = this.treeContainerElement.nativeElement.clientHeight;
    // let width: number = this.treeContainerElement.nativeElement.clientWidth;
    // this.buildTreeMap(width, height);
  }

  ngOnInit() {



    this._allTasks = this.taskService.tasks;
    this.taskService.tasks$.subscribe((tasks: Task[]) => {
      this._allTasks = tasks;
      this.completeTasks = Object.assign([],
        this._allTasks.filter((task: Task) => {
          if (!task.isComplete) {
            return task;
          }
        }));


      this.taskGroups = this.buildTaskGroups(this.completeTasks);

    });


    // let height: number = this.treeContainerElement.nativeElement.clientHeight;
    // let width: number = this.treeContainerElement.nativeElement.clientWidth;
    //For some reason that I'm not quite sure why, I need to subract 10 for the first time;
    // this.buildTreeMap(width, height-10);
  }


  buildTreeMap(width: number, height: number) {
    console.log("Width x height:", width, height);
    if (this.taskGroups.length > 0) {
      let treeMap: TreeMap = new TreeMap(width, height, this.taskGroups);
      this.treeMap = treeMap;
    }

  }




  private buildTaskGroups(tasks: Task[]): TaskGroup[] {

    let taskGroups: TaskGroup[] = [];

    for (let task of tasks) {
      let groupExists: boolean = false;
      taskGroups.forEach((taskGroup: TaskGroup) => {
        if (taskGroup.groupName == task.directory.rootDirectory) {
          groupExists = true;
          taskGroup.addTask(task);
        }
      });
      if (!groupExists) {
        taskGroups.push(new TaskGroup(task.directory.subPath(0), task));
      }
    }


    let percentages: any[] = [];
    let counts: any[] = [];
    let total: number = 0;
    taskGroups.forEach((taskGroup) => {
      total += taskGroup.totalTaskCount;
      counts.push({ name: taskGroup.groupName, count: taskGroup.totalTaskCount });
    });
    counts.forEach((count) => {
      percentages.push({ name: count.name, percent: ((count.count / total) * 100) });
    });
    percentages.sort((p1, p2) => {
      if (p1.percent > p2.percent) {
        return -1;
      }
      if (p1.percent < p2.percent) {
        return 1;
      }
      return 0;
    })

    console.log("Percentages:", percentages);

    return taskGroups;
  }


}
