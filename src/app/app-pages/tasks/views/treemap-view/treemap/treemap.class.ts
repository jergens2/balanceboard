
import { TaskGroup } from "../../../task-group/task-group.class";
import { ITreeMapItem } from "./treemap-item.interface";

export class TreeMap {


    private _treeMapValues: ITreeMapItem[] = [];
    public get treeMapValues(): ITreeMapItem[]{
        return this._treeMapValues;
    }

    constructor(width: number, height: number, taskGroups: TaskGroup[]) {
        console.log("Constructing TreeMap:", width, height, taskGroups);


        let treeMapValues: ITreeMapItem[] = [];

        let minimumPercentage = 25;
        

        let currentWidth: number = width;
        let currentHeight: number = height;
        let percentages: { taskGroup: TaskGroup, percent: number }[];

        let taskGroupValues = taskGroups.sort((taskGroup1, taskGroup2)=>{
            if(taskGroup1.totalTaskCount > taskGroup2.totalTaskCount){
                return -1;
            }
            if(taskGroup1.totalTaskCount < taskGroup2.totalTaskCount){
                return 1;
            }
            return 0;
        })

        while (taskGroupValues.length > 0) {
            percentages = this.calculateGroupPercentages(taskGroupValues);
            let currentValues: { taskGroup: TaskGroup, percent: number }[] = [percentages[0]];
            let currentTotalPercent: number = percentages[0].percent;
            while (currentTotalPercent <= minimumPercentage) {
                console.log("We are doing the thing.  cutting percentages[0]:", percentages[0].taskGroup.groupName);
               
                //the following line demonstrates a flaw with this current algorithm: that we are currently updating two separate arrays, in order to continue recursively.
                //i.e. the problem is that we are referencing 2 different sets, in stead of 1 set.
                // let index: number = taskGroupValues.findIndex((taskGroupValue)=>{
                //     return taskGroupValue.groupName == percentages[0].taskGroup.groupName;
                // })
                // console.log("INDEX IS ", index);
                // taskGroupValues = taskGroupValues.splice(index, 1); 
                
                taskGroupValues = taskGroupValues.slice(1);

                percentages = percentages.slice(1);
                currentValues.push(percentages[0]);
                currentTotalPercent += percentages[0].percent;
            }
            

            let valueWidth: number = currentWidth;
            let valueHeight: number = currentHeight;

            let direction: string;
            let flexDirection: string;
            if (currentWidth >= currentHeight) {
                direction = "HORIZONTAL";
                flexDirection = "row";
                console.log("     Current width cut down, from ", currentWidth)
                currentWidth = (currentWidth * (currentTotalPercent/100));
                console.log("      to new value: ", currentWidth);
            } else if (currentWidth < currentHeight) {
                direction = "VERTICAL";
                flexDirection = "column";
                console.log("     Current height cut down, from ", currentHeight)
                currentHeight = (currentHeight * (currentTotalPercent/100));
                console.log("      to new value: ", currentHeight);
            }


            let treeValue: ITreeMapItem;

            treeValue = {
                direction: direction,
                flexDirection: flexDirection,
                percentOfContainer: currentTotalPercent,
                taskGroupValues: currentValues,
                height: valueHeight,
                width: valueWidth
            }

            treeMapValues.push(treeValue)
            taskGroupValues = taskGroupValues.slice(1);
        }
        this._treeMapValues = treeMapValues;
        console.log("TreeMapValues: ", treeMapValues);

    }

    private calculateGroupPercentages(taskGroupValues: TaskGroup[]): { taskGroup: TaskGroup, percent: number }[] {
        let percentages: { taskGroup: TaskGroup, percent: number }[] = [];
        let counts: { taskGroup: TaskGroup, count: number }[] = [];
        let total: number = 0;
        taskGroupValues.forEach((taskGroup) => {
            total += taskGroup.totalTaskCount;
            counts.push({ taskGroup: taskGroup, count: taskGroup.totalTaskCount });
        });
        counts.forEach((count) => {
            percentages.push({ taskGroup: count.taskGroup, percent: ((count.count / total) * 100) });
        });
        percentages.sort((p1, p2) => {
            if (p1.percent > p2.percent) {
                return -1;
            }
            if (p1.percent < p2.percent) {
                return 1;
            }
            return 0;
        });

        return percentages;
    }

}