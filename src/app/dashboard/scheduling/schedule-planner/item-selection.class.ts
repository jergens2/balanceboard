import { ITimeBlock } from "./time-block.interface";
import * as moment from 'moment';

export class ItemSelection {

    private allTimeBlocks: ITimeBlock[] = []
    constructor(allTimeBlocks: ITimeBlock[]) {
        console.log("Item selection created");
        this.allTimeBlocks = allTimeBlocks;
    }



    timeBlocks: ITimeBlock[] = [];
    startTime: moment.Moment;
    endTime: moment.Moment;
    style: any = {};

    private anchorBlock: ITimeBlock = null;
    private currentlySelecting: boolean = false;



    mouseDownBlock(block: ITimeBlock) {
        this.currentlySelecting = true;
        this.anchorBlock = block;
        this.updateSelection(block);
    }
    mouseUp() {
        this.currentlySelecting = false;
        this.timeBlocks.forEach((timeBlock)=>{
            timeBlock.isHighlighted = false;
        });
    }
    mouseEnterBlock(block: ITimeBlock) {
        if (this.currentlySelecting) {
            this.updateSelection(block);
        }
    }

    private updateSelection(block: ITimeBlock) {
        this.timeBlocks.forEach((timeBlock)=>{
            timeBlock.isHighlighted = false;
        })
        if (block == this.anchorBlock) {
            this.style = {
                "grid-row-start": this.anchorBlock.gridRowStart,
                "grid-row-end": this.anchorBlock.gridRowStart + 1,
                "grid-column": "" + this.anchorBlock.gridColumnStart + " / span 1",
            };
            this.startTime = moment(this.anchorBlock.startTime);
            this.endTime = moment(this.anchorBlock.endTime);
        } else {
            let startBlock: ITimeBlock = this.anchorBlock;
            let endBlock: ITimeBlock = block;
            if (this.anchorBlock.startTime.isAfter(moment(this.anchorBlock.startTime).hour(endBlock.startTime.hour()).minute(endBlock.startTime.minute())) ) {
                startBlock = block;
                endBlock = this.anchorBlock;
            }
            let startTime = moment(startBlock.startTime);
            let endTime = moment(startTime).hour(endBlock.endTime.hour()).minute(endBlock.endTime.minute());

            let currentBlock: ITimeBlock = startBlock;
            // let msStart = moment();
            this.timeBlocks = this.allTimeBlocks.filter((timeBlock)=>{
                if(timeBlock.startTime.isSameOrAfter(startTime) && timeBlock.endTime.isSameOrBefore(endTime)){
                    return timeBlock;
                }
            });
            // let msEnd = moment();
            // console.log("It took this many milliseconds:", msEnd.diff(msStart, "milliseconds"))
            // this.timeBlocks.forEach((timeBlock)=>{
            //     timeBlock.isHighlighted = true;
            // })
            let gridRowStart: number = startBlock.gridRowStart
            let gridRowEnd: number = endBlock.gridRowStart + 1;
            let gridColumnStart: number = startBlock.gridColumnStart;
            

            this.startTime = moment(startTime);
            this.endTime = moment(endTime);

            this.style = {
                "grid-row-start":gridRowStart,
                "grid-row-end": gridRowEnd,
                "grid-column": "" + gridColumnStart + " / span 1",
            }

        }

    }

}