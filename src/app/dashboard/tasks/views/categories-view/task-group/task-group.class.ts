import { Task } from "../../../task/task.model";

export class TaskGroup {
    groupName: string = "";
    tasks: Task[] = [];
    subGroups: TaskGroup[] = [];

    constructor(){
        
    }

    public get totalTaskCount(): number{
        let count = this.tasks.length;
        if(this.subGroups.length > 0){
            this.subGroups.forEach((group)=>{
                count += group.totalTaskCount;
            })
        }
        return count;
    }
}