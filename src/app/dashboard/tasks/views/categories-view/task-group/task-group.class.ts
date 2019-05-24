import { Task } from "../../../task/task.model";
import { Directory } from "../../../../../shared/directory/directory.class";

export class TaskGroup {

    groupName: string = "";
    tasks: Task[] = [];
    subGroups: TaskGroup[] = [];

    constructor(name: string, task: Task) {
        // this._directory = directory;
        this.groupName = name;
        this.subGroups = [];
        this.addTask(task);
    }


    public addTask(task: Task) {

        let currentIndex: number = task.directory.indexOf(this.groupName);
        let targetIndex: number = task.directory.depth - 1;

        if (currentIndex == targetIndex) {
            this.tasks.push(task);
        } else if (targetIndex-currentIndex == 1) {
            let subGroupExists: boolean = false;
            this.subGroups.forEach((subGroup) => {
                if (subGroup.groupName == task.directory.specificDirectory) {
                    subGroupExists = true;
                    subGroup.addTask(task);
                }
            });
            if (!subGroupExists) {
                this.subGroups.push(new TaskGroup(task.directory.specificDirectory, task));
            }
        } else if(targetIndex-currentIndex > 1){

            let nextIndex: number = currentIndex+1;
            let nextPath = task.directory.atIndex(nextIndex);

            
            let subGroupExists: boolean = false;
            this.subGroups.forEach((subGroup) => {
                if (subGroup.groupName == nextPath) {
                    subGroupExists = true;
                    subGroup.addTask(task);
                }
            });
            if (!subGroupExists) {
                this.subGroups.push(new TaskGroup(nextPath, task));
            }
        }

    }


    public get totalTaskCount(): number {
        let count = this.tasks.length;
        if (this.subGroups.length > 0) {
            this.subGroups.forEach((group) => {
                count += group.totalTaskCount;
            })
        }
        return count;
    }
}