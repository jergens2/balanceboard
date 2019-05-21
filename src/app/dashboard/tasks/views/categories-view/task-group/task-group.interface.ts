import { Task } from "../../../task/task.model";

export interface ITaskGroup {
    groupName: string,
    tasks: Task[],
    subGroups: ITaskGroup[],
}