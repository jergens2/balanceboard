import { TaskGroup } from "../../../task-group/task-group.class";

export interface ITreeMapItem{
    direction: string,
    flexDirection: string,
    percentOfContainer: number,
    taskGroupValues: { taskGroup: TaskGroup, percent: number }[],
    height: number,
    width: number,
}