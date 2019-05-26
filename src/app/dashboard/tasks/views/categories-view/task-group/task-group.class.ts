import { Task } from "../../../task/task.model";
import { Directory } from "../../../../../shared/directory/directory.class";

export class TaskGroup {

    groupName: string = "";
    tasks: Task[] = [];
    subGroups: TaskGroup[] = [];

    mouseOver: boolean = false;
    
    private _directory: Directory;
    public get directory(): Directory{
        return this._directory;
    }

    constructor(directoryPath: string, task: Task) {
        this._directory = new Directory(directoryPath);
        this.groupName = this._directory.specificDirectory;
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

                this.subGroups.push(new TaskGroup(task.directory.fullPath, task));
            }
        } else if(targetIndex-currentIndex > 1){

            let nextIndex: number = currentIndex+1;
            let nextPath = task.directory.atIndex(nextIndex);
            let subPath = task.directory.subPath(nextIndex);            
            
            let subGroupExists: boolean = false;
            this.subGroups.forEach((subGroup) => {
                if (subGroup.groupName == nextPath) {
                    subGroupExists = true;
                    subGroup.addTask(task);
                }
            });
            if (!subGroupExists) {
                this.subGroups.push(new TaskGroup(subPath, task));
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