
import { BehaviorSubject, Observable } from "rxjs";
import { TimelogDelineator, TimelogDelineatorType } from "../../../timelog-delineator.class";
import * as moment from 'moment';
import { DaybookAvailabilityType } from "../../../../../controller/items/daybook-availability-type.enum";
import { DaybookController } from "../../../../../controller/daybook-controller.class";
import { TimelogEntryItem } from "../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { ToolboxService } from "../../../../../../../toolbox-menu/toolbox.service";
import { TLEFGridBarItem } from "./tlef-grid-bar-item.class";


export class TLEFGridItemsBar {

    private _timeDelineators: TimelogDelineator[] = [];
    private _activeDayController: DaybookController;
    private _clock: moment.Moment;
    private toolboxService: ToolboxService;

    constructor(timeDelineators: TimelogDelineator[], activeDayController: DaybookController,
        clock: moment.Moment, toolboxService: ToolboxService, activeItem?: TLEFGridBarItem) {
        this.toolboxService = toolboxService;
        this._clock = clock;
        this._timeDelineators = timeDelineators;
        this._activeDayController = activeDayController;
        this._update();
        if (activeItem) {
            // console.log("There was already an active item.  Re-opening it.", activeItem)
            const foundExistingIndex = this._findActiveIndex(activeItem);
            if (foundExistingIndex > -1 && foundExistingIndex < this.gridBarItems.length) {
                this.openDisplayGridItem(this.gridBarItems[foundExistingIndex]);
            } else {
                if (activeItem.availabilityType === DaybookAvailabilityType.SLEEP) {
                    if (activeItem.index === 0) {
                        this.openDisplayGridItem(this.gridBarItems[0]);
                    } else {
                        this.openDisplayGridItem(this.gridBarItems[this.gridBarItems.length - 1]);
                    }
                } else {
                    console.log("Error: could not determine which grid item")
                }
            }
        } else {
            // console.log("No active item")
        }
    }

    private _gridBarItems: TLEFGridBarItem[] = [];
    private _activeGridBarItem$: BehaviorSubject<TLEFGridBarItem> = new BehaviorSubject(null);
    public get gridBarItems(): TLEFGridBarItem[] { return this._gridBarItems; }
    public get activeGridBarItem$(): Observable<TLEFGridBarItem> { return this._activeGridBarItem$.asObservable(); }
    public get activeGridBarItem(): TLEFGridBarItem { return this._activeGridBarItem$.getValue(); }

    public getItemAtTime(timeToCheck: moment.Moment): TLEFGridBarItem {
        const foundItem = this.gridBarItems.find(item =>{
            return timeToCheck.isSameOrAfter(item.startTime) && timeToCheck.isBefore(item.endTime);
        });
        if(foundItem){
            return foundItem;
        }else{
            console.log("Error finding grid item at time: " + timeToCheck.format('YYYY-MM-DD hh:mm a'));
            return null;
        }

    }

    public goRight() {
        const currentIndex = this.gridBarItems.indexOf(this.activeGridBarItem);
        if (currentIndex < this.gridBarItems.length - 1) {
            this.openDisplayGridItem(this.gridBarItems[currentIndex + 1]);
        }
    }
    public goLeft() {
        const currentIndex = this.gridBarItems.indexOf(this.activeGridBarItem);
        if (currentIndex > 0) {
            this.openDisplayGridItem(this.gridBarItems[currentIndex - 1]);
        }
    }


    public openDisplayGridItem(item: TLEFGridBarItem) {
        if (item.availabilityType === DaybookAvailabilityType.SLEEP) {
            this.toolboxService.openSleepEntryForm();
        } else {
            this.toolboxService.openTimelogEntryForm();
        }
        this.gridBarItems.forEach((item) => {
            item.isActive = false;
            item.isCurrent = false;
        });
        item.isActive = true;
        const currentItem = this.gridBarItems.find(item => item.endTime.isSame(moment(this._clock).startOf('minute')));
        if (currentItem) {
            currentItem.isCurrent = true;
        }
        this._activeGridBarItem$.next(item);
    }

    public closeGridItem() {
        this.gridBarItems.forEach(item => item.isActive = false);
        this._activeGridBarItem$.next(null);

    }

    private _findAvailableEntry(openedEntryStart: moment.Moment, openedEntryEnd: moment.Moment): TimelogEntryItem {
        const items = this._activeDayController.fullScheduleItems.filter(item => item.value !== DaybookAvailabilityType.SLEEP);
        const foundDirectItem = items.find((gridItem) => {
            return openedEntryStart.isSameOrAfter(gridItem.startTime) && openedEntryEnd.isSameOrBefore(gridItem.endTime);
        });
        if (foundDirectItem) {
            return new TimelogEntryItem(foundDirectItem.startTime, foundDirectItem.endTime);
        } else {
            const foundSimilarItem = items.find((gridItem) => {
                return openedEntryStart.isSame(gridItem.startTime) || openedEntryEnd.isSame(gridItem.endTime);
            });
            if (foundSimilarItem) {
                return new TimelogEntryItem(foundSimilarItem.startTime, foundSimilarItem.endTime);;
            } else {
                return null;
            }
        }
    }

    private _findActiveIndex(activeItem: TLEFGridBarItem): number {
        const foundActiveIndex = this.gridBarItems.findIndex((gridBarItem) => {
            const sameStart = activeItem.startTime.isSame(gridBarItem.startTime);
            const sameEnd = activeItem.endTime.isSame(gridBarItem.endTime);
            return sameStart || sameEnd;
        });
        return foundActiveIndex;
    }


    private _update() {

        let gridBarItems: TLEFGridBarItem[] = [];

        let currentActiveIndex = -1;
        if (this.activeGridBarItem) {
            currentActiveIndex = this._gridBarItems.indexOf(this.activeGridBarItem);
        }

        if (this._timeDelineators.length > 0) {
            let currentTime: moment.Moment = this._timeDelineators[0].time;
            for (let i = 1; i < this._timeDelineators.length; i++) {
                let skip: boolean = false;
                if (this._timeDelineators[i].delineatorType === TimelogDelineatorType.NOW) {

                    if (i > 0 && i < this._timeDelineators.length - 1) {
                        const prev = this._timeDelineators[i - 1].delineatorType;
                        const next = this._timeDelineators[i + 1].delineatorType;
                        const tleStart = TimelogDelineatorType.TIMELOG_ENTRY_START;
                        const tleEnd = TimelogDelineatorType.TIMELOG_ENTRY_END;
                        const faTime = TimelogDelineatorType.FALLASLEEP_TIME;
                        const wuTime = TimelogDelineatorType.WAKEUP_TIME;
                        if (prev === tleStart && (next === tleStart || next === tleEnd || next === faTime)) {
                            skip = true;
                        }
                    }
                }

                if (!skip) {
                    let endTime: moment.Moment = this._timeDelineators[i].time;
                    let availability: DaybookAvailabilityType = this._activeDayController.getDaybookAvailability(currentTime, endTime);
                    let newItem = new TLEFGridBarItem(currentTime, endTime, availability);
                    // if (availability === DaybookAvailabilityType.SLEEP) {
                    //     newItem.sleepEntry = this._activeDayController.getSleepItem(currentTime, endTime);
                    // } else if (availability === DaybookAvailabilityType.TIMELOG_ENTRY) {
                    //     newItem.timelogEntry = this._activeDayController.timelogEntryItems.find((tle) => {
                    //         return tle.startTime.isSame(currentTime) && tle.endTime.isSame(endTime);
                    //     });
                    // } else if (availability === DaybookAvailabilityType.AVAILABLE) {
                    //     newItem.timelogEntry = this._findAvailableEntry(currentTime, endTime);
                    // }
                    gridBarItems.push(newItem);
                    currentTime = moment(endTime);
                }

            }
        } else {
            console.log("Error with timeDelineators.");
        }

        this._gridBarItems = gridBarItems;
        this._gridBarItems.forEach(item => item.index = this._gridBarItems.indexOf(item));

        if (currentActiveIndex > -1 && currentActiveIndex < this._gridBarItems.length) {
            this.openDisplayGridItem(this._gridBarItems[currentActiveIndex]);
        }

        // console.log("Updating Grid bar items:")
        // this._gridBarItems.forEach(item => {
        //   console.log("   " + item.startTime.format('YYYY-MM-DD hh:mm:ss a') + " to " + item.endTime.format("YYYY-MM-DD hh:mm:ss a") + "  : " + item.availabilityType)
        // })
    }


}