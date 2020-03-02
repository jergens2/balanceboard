import { DisplayGridBarItem } from "./display-grid-bar-item.class";
import { BehaviorSubject, Observable } from "rxjs";
import { TimelogDelineator } from "../../timelog-delineator.class";
import * as moment from 'moment';
import { DaybookAvailabilityType } from "../../../../controller/items/daybook-availability-type.enum";
import { DaybookController } from "../../../../controller/daybook-controller.class";
import { TimelogEntryItem } from "../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { TimelogEntryFormService } from "../timelog-entry-form.service";

export class DisplayGridItemsBar {

    private _timeDelineators: TimelogDelineator[] = [];
    private _activeDayController: DaybookController;
    private _clock: moment.Moment;
    private _tlefService: TimelogEntryFormService;

    constructor(timeDelineators: TimelogDelineator[], activeDayController: DaybookController, 
        clock: moment.Moment, tlefService: TimelogEntryFormService, activeItem?: DisplayGridBarItem) {
        this._tlefService = tlefService;
        this._clock = clock;
        this._timeDelineators = timeDelineators;
        this._activeDayController = activeDayController;
        this._update();
        if(activeItem){
            // console.log("There was already an active item.  Re-opening it.", activeItem)
            const foundExistingIndex = this._findActiveIndex(activeItem);
            if(foundExistingIndex > -1 && foundExistingIndex < this.gridBarItems.length){
                this.openDisplayGridItem(this.gridBarItems[foundExistingIndex]);
            }else{
                if(activeItem.availabilityType === DaybookAvailabilityType.SLEEP){
                    if(activeItem.index === 0){
                        this.openDisplayGridItem(this.gridBarItems[0]);
                    }else{
                        this.openDisplayGridItem(this.gridBarItems[this.gridBarItems.length-1]);
                    }
                }else{
                    console.log("Error: could not determine which grid item")
                }
            }
        }else{
            // console.log("No active item")
        }
    }

    private _gridBarItems: DisplayGridBarItem[] = [];
    private _activeGridBarItem$: BehaviorSubject<DisplayGridBarItem> = new BehaviorSubject(null);
    public get gridBarItems(): DisplayGridBarItem[] { return this._gridBarItems; }
    public get activeGridBarItem$(): Observable<DisplayGridBarItem> { return this._activeGridBarItem$.asObservable(); }
    public get activeGridBarItem(): DisplayGridBarItem { return this._activeGridBarItem$.getValue(); }


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


    public openDisplayGridItem(item: DisplayGridBarItem) {
        if (item.availabilityType === DaybookAvailabilityType.SLEEP) {
            this._tlefService.openSleepEntry(item.sleepEntry);
          } else {
            this._tlefService.openTimelogEntry(item.timelogEntry);
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

    private _findActiveIndex(activeItem: DisplayGridBarItem): number{
        const foundActiveIndex = this.gridBarItems.findIndex((gridBarItem)=>{
            const sameStart = activeItem.startTime.isSame(gridBarItem.startTime);
            const sameEnd = activeItem.endTime.isSame(gridBarItem.endTime);
            return sameStart || sameEnd;
        });
        return foundActiveIndex;
    }


    private _update() {

        let gridBarItems: DisplayGridBarItem[] = [];

        let currentActiveIndex = -1;
        if (this.activeGridBarItem) {
            currentActiveIndex = this._gridBarItems.indexOf(this.activeGridBarItem);
        }

        if (this._timeDelineators.length > 0) {
            let currentTime: moment.Moment = this._timeDelineators[0].time;
            for (let i = 1; i < this._timeDelineators.length; i++) {
                let endTime: moment.Moment = this._timeDelineators[i].time;
                let availability: DaybookAvailabilityType = this._activeDayController.getDaybookAvailability(currentTime, endTime);
                let newItem = new DisplayGridBarItem(currentTime, endTime, availability);
                if (availability === DaybookAvailabilityType.SLEEP) {
                    newItem.sleepEntry = this._activeDayController.getSleepItem(currentTime, endTime);
                } else if (availability === DaybookAvailabilityType.TIMELOG_ENTRY) {
                    newItem.timelogEntry = this._activeDayController.timelogEntryItems.find((tle) => {
                        return tle.startTime.isSame(currentTime) && tle.endTime.isSame(endTime);
                    });
                } else if (availability === DaybookAvailabilityType.AVAILABLE) {
                    newItem.timelogEntry = this._findAvailableEntry(currentTime, endTime);
                }
                gridBarItems.push(newItem);
                currentTime = moment(endTime);
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