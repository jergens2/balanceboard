import { Component, OnInit } from '@angular/core';
import { Task } from '../../task/task.model';
import { TaskService } from '../../task.service';
import { ITaskGroup } from './task-group/task-group.interface';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.css']
})
export class CategoriesViewComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  private _allTasks: Task[] = [];
  public categoriesTasks: Task[] = [];

  ngOnInit() {
    this._allTasks = this.taskService.tasks;
    this.taskService.tasks$.subscribe((tasks) => {
      this._allTasks = tasks;
      this.categoriesTasks = Object.assign([], this._allTasks);

      this.buildGroups(this.categoriesTasks);
    });
  }

  groups: ITaskGroup[] = [];







  private buildGroups(tasks: Task[]): ITaskGroup[] {

    /*
        2019-05-20:
        Note:  this method currently does not check for bad syntax, it just finds the ones that have the correct syntax, 
        as in, as of now this part of the app is relying on the user to use the correct syntax.

    */
    let groups: ITaskGroup[] = [];
    function addTask(task: Task, groupName: string) {



      if (groups.length == 0) {
        groups.push(createNewGroup(task, groupName, task.groupCategories));
      } else if (groups.length > 0) {
        let alreadyExists: boolean = false;

        groups.forEach((group: ITaskGroup) => {
          if (group.groupName == groupName) {
            alreadyExists = true;

            addToExistingGroup(group, task);
          }
        });
        if (!alreadyExists) {
          groups.push(createNewGroup(task, groupName, task.groupCategories));
        }

      }



    }

    function createNewGroup(task: Task, groupName: string, groupCategories: string[]): ITaskGroup {
      console.log("    Creating a new group with:", groupName)
      console.log("    Group categories are ", groupCategories.toString());
      let subGroups: ITaskGroup[];
      let tasks: Task[] = [];

      let targetGroupName: string = task.groupCategories[task.groupCategories.length - 1];
      if (groupName == targetGroupName) {
        subGroups = [];
        tasks.push(task);
      } else {
        let subMatches: string[] = groupCategories.slice(1);
        let newGroupName: string = subMatches[0];
        console.log("    Creating a subgroup, ", newGroupName)
        subGroups = [createNewGroup(task, newGroupName, subMatches)];
      }

      let newGroup: ITaskGroup = {
        groupName: groupName,
        tasks: tasks,
        subGroups: subGroups,
      }

      return newGroup;
    }

    function addToExistingGroup(group: ITaskGroup, task: Task) {
      console.log("GroupName: ", group.groupName, "Adding this task: ", task.groupCategory);

      let targetGroupName: string = task.groupCategories[task.groupCategories.length - 1];

      if (group.groupName == targetGroupName) {
        group.tasks.push(task);
      } else {
        let subGroups: string[] = task.groupCategories.splice(1);
        let newGroupName: string = subGroups[0];
        if (group.subGroups.length == 0) {
          group.subGroups.push(createNewGroup(task, newGroupName, subGroups))
        } else {
          let alreadyExists: boolean = false;

          group.subGroups.forEach((subGroup: ITaskGroup) => {
            if (subGroup.groupName == newGroupName) {
              alreadyExists = true;

              addToExistingGroup(subGroup, task);
            }
          });
          if (!alreadyExists) {
            group.subGroups.push(createNewGroup(task, newGroupName, task.groupCategories));
          }
        }


      }

    }



    tasks.forEach((task) => {
      console.log("Adding task to groups: ", task.groupCategory);

      if (task.groupCategories.length < 1) {
        console.log("Warning: no root matches");
      } else if (task.groupCategories.length >= 1) {
        addTask(task, task.groupCategories[0]);
        console.log("groups is now: ", groups);
      }

    })







    return groups;
  }



  private buildGroup(task: Task, matches: string[]): ITaskGroup {
    console.log("    matches", matches)
    let taskGroup: ITaskGroup;
    if (matches.length == 1) {
      taskGroup = {
        groupName: matches[0],
        tasks: [task],
        subGroups: []
      }
    } else if (matches.length > 1) {
      let subMatches: string[] = matches.slice(1);
      console.log("      subMatches: ", subMatches)
      taskGroup = {
        groupName: matches[0],
        tasks: [task],
        // subGroups: [this.buildGroup(task, subMatches)]
        subGroups: []
      }
    } else {
      console.log("Error with matches");
    }
    console.log("taskGroup built:", taskGroup);
    return taskGroup;
  }


  private addToGroup(group: ITaskGroup, task: Task, matches: string[]) {


    if (matches.length == 1) {
      group.tasks.push(task);
    } else if (matches.length > 1) {

      let subMatches: string[] = matches.slice(1);

      group.subGroups.forEach((group: ITaskGroup) => {


        let alreadyExists: boolean = false;
        if (group.groupName == subMatches[0]) {
          alreadyExists = true;
          this.addToGroup(group, task, subMatches);
        }
        if (alreadyExists == false) {
          this.groups.push(this.buildGroup(task, matches));
        }

      });
    }


  }

}
