import { TimelogEntryItem } from "../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { TLEFFormCase } from "./tlef-form-case.enum";
import * as moment from 'moment';
import { Observable, BehaviorSubject } from "rxjs";
import { DisplayGridItemsBar } from "./daybook-grid-items-bar/daybook-grid-items-bar.class";
import { DisplayGridBarItem } from "./daybook-grid-items-bar/display-grid-bar-item.class";
import { DaybookController } from "../../../controller/daybook-controller.class";
import { TimelogDelineator, TimelogDelineatorType } from "../timelog-delineator.class";
import { ToolboxService } from "../../../../../toolbox-menu/toolbox.service";
import { DaybookTimePosition } from "../../../daybook-time-position-form/daybook-time-position.enum";
import { TimelogDisplayGridItem } from "../timelog-display-grid-item.class";
import { DaybookAvailabilityType } from "../../../controller/items/daybook-availability-type.enum";
import { ToolType } from "../../../../../toolbox-menu/tool-type.enum";
import { TLEFControllerItem } from "./TLEF-controller-item.class";
import { SleepEntryItem } from "./sleep-entry-form/sleep-entry-item.class";
import { DaybookDisplayUpdate, DaybookDisplayUpdateType } from "../../../controller/items/daybook-display-update.interface";

export class TLEFController {

    private _clock: moment.Moment;


    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);



    private _tlefItems: TLEFControllerItem[] = [];

    private _timeDelineators: TimelogDelineator[] = [];
    private _activeDayController: DaybookController;
    private _currentlyOpenTLEFItem$: BehaviorSubject<TLEFControllerItem> = new BehaviorSubject(null);
    private toolboxService: ToolboxService;

    constructor(timeDelineators: TimelogDelineator[], activeDayController: DaybookController,
        clock: moment.Moment, toolboxService: ToolboxService, ) {

        console.log("Constructing TLEF Controller");
        this._timeDelineators = timeDelineators;
        this._activeDayController = activeDayController;
        this.toolboxService = toolboxService;

        this._clock = moment(clock);
        this._buildItems();
        this._setToolboxSub();

    }

    public get formIsOpen(): boolean { return this._currentlyOpenTLEFItem$.getValue() !== null; }
    public get currentlyOpenTLEFItem$(): Observable<TLEFControllerItem> { return this._currentlyOpenTLEFItem$.asObservable(); }

    public get changesMade(): boolean { return this._changesMadeTLE$.getValue() !== null; }
    // public get showDeleteButton(): boolean { return this._initialValue.isSavedEntry; }
    // public get formCase(): TLEFFormCase { return this._formCase; }

    public get tlefItems(): TLEFControllerItem[] { return this._tlefItems; }
    public get gridBarItems(): DisplayGridBarItem[] { return this.tlefItems.map(item => item.gridBarItem); }

    public get changesMadeTLE$(): Observable<TimelogEntryItem> { return this._changesMadeTLE$.asObservable(); }
    public get changesMadeTLE(): TimelogEntryItem { return this._changesMadeTLE$.getValue(); }

    public get currentlyOpenTLEFItem(): TLEFControllerItem { return this._currentlyOpenTLEFItem$.getValue(); }

    public get activeItem(): TLEFControllerItem { return this._tlefItems.find(item => item.isActive); }
    public get showDeleteButton(): boolean { return this.currentlyOpenTLEFItem.getInitialTLEValue().isSavedEntry; }

    public get isNew(): boolean {
        const isNew = [
            TLEFFormCase.NEW_CURRENT,
            TLEFFormCase.NEW_CURRENT_FUTURE,
            TLEFFormCase.NEW_FUTURE,
            TLEFFormCase.NEW_PREVIOUS
        ].indexOf(this.currentlyOpenTLEFItem.formCase) > -1;
        return isNew;
    }

    public update(timeDelineators: TimelogDelineator[], activeDayController: DaybookController, clock: moment.Moment, update: DaybookDisplayUpdate) {
        console.log("Updating the TLEF Controller by " + update.type + "   - " + clock.format('hh:mm:ss a'))
        this._clock = moment(clock);
        this._timeDelineators = timeDelineators;
        this._activeDayController = activeDayController;


        let currentItem: TLEFControllerItem;
        let currentIndex = -1;
        if (this.currentlyOpenTLEFItem) {
            currentItem = this.currentlyOpenTLEFItem;
            currentIndex = this.tlefItems.indexOf(currentItem);
        }
        this._buildItems();
        if (currentItem) {

            if (currentItem.formCase === TLEFFormCase.NEW_CURRENT) {
                const activeItem = this._tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
                this._setActiveItem(activeItem);
            } else if (currentItem.formCase === TLEFFormCase.NEW_CURRENT_FUTURE) {
                const activeItem = this._tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
                this._setActiveItem(activeItem);
            } else {
                let foundItem;
                foundItem = this._tlefItems.find(item => {
                    return item.isSame(currentItem);
                })
                if (!foundItem) {
                    foundItem = this.tlefItems[currentIndex];
                }
                this._openTLEFItem(foundItem);
            }
        }
        // if (update.type === DaybookDisplayUpdateType.CLOCK) {
        //     if (this.formIsOpen) {
        //     } else {
        //     }
        // } else {
        // }
    }


    private _setActiveItem(activeItem) {
        this._tlefItems.forEach(tlefItem => {
            if (tlefItem.isSame(activeItem)) {
                tlefItem.setAsActive();
            } else {
                tlefItem.setAsNotActive();
            }
        });
    }

    public goLeft() {
        console.log("Go left clicked")
        const activeItem = this.activeItem;
        let currentIndex = -1;
        if (activeItem) {
            currentIndex = this._tlefItems.indexOf(activeItem);
        }
        if (currentIndex > 0) {
            const openItem = this._tlefItems[currentIndex - 1];
            this._openTLEFItem(openItem);
        }
    }
    public goRight() {
        console.log("Go right clicked")
        const activeItem = this.activeItem;
        let currentIndex = -1;
        if (activeItem) {
            currentIndex = this._tlefItems.indexOf(activeItem);
        }
        if (currentIndex < this._tlefItems.length - 1) {
            const openItem = this._tlefItems[currentIndex + 1];
            this._openTLEFItem(openItem);
        }
    }
    public onClickGridBarItem(gridItem: DisplayGridBarItem) {
        console.log("Grid bar item clicked: ", gridItem)
        this._tlefItems.forEach((item) => {
            if (item.gridBarItem.startTime.isSame(gridItem.startTime) && item.gridBarItem.endTime.isSame(gridItem.endTime)) {
                this._openTLEFItem(item);
            }
        });
    }


    public openWakeupTime() {
        this._openTLEFItem(this._tlefItems[0]);
    }

    public openFallAsleepTime() {
        this._openTLEFItem(this._tlefItems[this._tlefItems.length - 1]);
    }



    public drawNewTimelogEntry(openTLE: TimelogEntryItem) {

        console.log("DRAWING TLE:", openTLE);
        // openTLE.logToConsole();
        const formCase = this._determineCase(openTLE);
        const newItem = new TLEFControllerItem(openTLE.startTime, openTLE.endTime,
            DaybookAvailabilityType.AVAILABLE, formCase, openTLE, null,
            new TimelogDelineator(openTLE.startTime, TimelogDelineatorType.TIMELOG_ENTRY_START),
            new TimelogDelineator(openTLE.endTime, TimelogDelineatorType.TIMELOG_ENTRY_END));
        this._currentlyOpenTLEFItem$.next(newItem);
        this.toolboxService.openTool(ToolType.TIMELOG_ENTRY);
    }

    public openNewCurrentTimelogEntry(currentTimePosition: DaybookTimePosition, newCurrentTLE: TimelogEntryItem) {
        console.log("NEW CURRENT TLE:  method incomplete")
        console.log("currentTimePosition is " + currentTimePosition);
        // if (currentTimePosition === DaybookTimePosition.NORMAL) {
        //     if (newCurrentTLE) {
        //         // const foundGridItem = this.gridBarItems.find(item => {
        //         //     return item.availabilityType === DaybookAvailabilityType.AVAILABLE
        //         //         && item.startTime.isSame(newCurrentTLE.startTime) && item.endTime.isSame(newCurrentTLE.endTime);
        //         // });
        //         // if (foundGridItem) {
        //         //     this._openDisplayGridItem(foundGridItem);
        //         // } else {
        //         //     console.log("Error: could not find new current tlef")
        //         // }
        //     } else {
        //         // const foundGridItem = this.gridBar.getItemAtTime(this._clock);
        //         // if (foundGridItem) {
        //         //     this._openDisplayGridItem(foundGridItem);
        //         // } else {
        //         //     console.log("Error: could not find an item to open");
        //         // }
        //     }

        // } else {
        //     this.toolboxService.openNewDayForm();
        // }
    }



    public openTimelogGridItem(gridItem: TimelogDisplayGridItem, currentTimePosition: DaybookTimePosition) {
        /**
         * the TimelogDisplayGridItems should always be up to date / synched with the clock.
         */



        console.log("opening grid item: " + gridItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm a'));
        if (currentTimePosition === DaybookTimePosition.NORMAL) {


            if (gridItem.isMerged) {
                if (gridItem.timelogEntries.length >= 2) {
                    let biggest = gridItem.timelogEntries[0];
                    gridItem.timelogEntries.forEach((item) => {
                        if (item.durationMilliseconds > biggest.durationMilliseconds) {
                            biggest = item;
                        }
                    });
                    const foundItem = this.tlefItems.find(item => {
                        return item.availability === DaybookAvailabilityType.TIMELOG_ENTRY
                            && item.startTime.isSameOrAfter(biggest.startTime) && item.endTime.isSame(biggest.endTime);
                    });
                    if (foundItem) {
                        this._openTLEFItem(foundItem);
                    } else {
                        console.log("error finding item -- " + gridItem.startTime.format('YYYY-MM-DD hh:mm:ss a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm:ss a'));
                        this.tlefItems.forEach((item) => {
                            console.log("   Grid bar item: " + item.startTime.format("YYYY-MM-DD hh:mm:ss a") + " to " + item.endTime.format('YYYY-MM-DD hh:mm:ss a'))
                        });
                    }
                } else {
                    console.log("Error with timelog entries")
                }
            } else {
                // non merged item.
                const foundItem = this.tlefItems.find(item => {
                    return item.availability === gridItem.availability
                        && item.startTime.isSame(gridItem.startTime) && item.endTime.isSame(gridItem.endTime);
                });
                if (foundItem) {
                    this._openTLEFItem(foundItem);
                } else {
                    console.log("Error finding grid item -- " + gridItem.startTime.format('YYYY-MM-DD hh:mm:ss a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm:ss a'));
                    this.tlefItems.forEach((item) => {
                        console.log("   Grid bar item: " + item.startTime.format("YYYY-MM-DD hh:mm:ss a") + " to " + item.endTime.format('YYYY-MM-DD hh:mm:ss a'))
                    });
                }
            }
        } else {

            //to do:  more stuff here.

            console.log("TIME POSITION WAS NOT NORMAL, so therefore opening the Daybook form by the toolservice.")
            this.toolboxService.openNewDayForm();
        }
    }

    private _openTLEFItem(item: TLEFControllerItem) {
        console.log("Opening TLEF Item", item);
        this._setActiveItem(item);
        this._currentlyOpenTLEFItem$.next(item);

        if (item.formCase === TLEFFormCase.SLEEP) {
            this.toolboxService.openSleepEntryForm();
        } else {
            this.toolboxService.openTimelogEntryForm();
        }
    }


    public makeChangesTLE(changedItem: TimelogEntryItem) {
        console.log("Changes made: ", changedItem)
        this._changesMadeTLE$.next(changedItem);
    }



    private _buildItems() {
        let items: TLEFControllerItem[] = [];
        if (this._timeDelineators.length > 0) {
            let currentTime: moment.Moment = this._timeDelineators[0].time;
            for (let i = 1; i < this._timeDelineators.length; i++) {
                const startDelineator: TimelogDelineator = this._timeDelineators[i - 1];
                const endDelineator: TimelogDelineator = this._timeDelineators[i];
                let intersects: boolean = false;
                if (i < this._timeDelineators.length - 1) {
                    intersects = this._nowLineIntersects(startDelineator, endDelineator, this._timeDelineators[i + 1].delineatorType);
                }
                if (!intersects) {
                    let endTime: moment.Moment = endDelineator.time;
                    const availability: DaybookAvailabilityType = this._activeDayController.getDaybookAvailability(currentTime, endTime);
                    let timelogEntry: TimelogEntryItem = new TimelogEntryItem(currentTime, endTime);
                    let sleepEntry: SleepEntryItem;
                    if (availability === DaybookAvailabilityType.SLEEP) {
                        sleepEntry = this._activeDayController.getSleepItem(currentTime, endTime);
                    } else if (availability === DaybookAvailabilityType.TIMELOG_ENTRY) {
                        timelogEntry = this._activeDayController.getTimelogEntryItem(currentTime, endTime);
                    }
                    const formCase = this._determineCase(timelogEntry);
                    let newItem: TLEFControllerItem = new TLEFControllerItem(currentTime, endTime, availability, formCase, timelogEntry, sleepEntry, startDelineator, endDelineator);
                    items.push(newItem);
                    currentTime = moment(endDelineator.time);
                }
            }
        } else {
            console.log("Error with timeDelineators.");
        }
        this._tlefItems = items;
    }

    /**
     * Checks to see if the NOW line is between the start and end of an existing TLE.
     */
    private _nowLineIntersects(startDelineator: TimelogDelineator, endDelineator: TimelogDelineator, nextDelineatorType: TimelogDelineatorType): boolean {
        let intersects: boolean = false;
        if (endDelineator.delineatorType === TimelogDelineatorType.NOW) {

            const prev = startDelineator.delineatorType;
            const tleStart = TimelogDelineatorType.TIMELOG_ENTRY_START;
            const tleEnd = TimelogDelineatorType.TIMELOG_ENTRY_END;
            const faTime = TimelogDelineatorType.FALLASLEEP_TIME;
            const wuTime = TimelogDelineatorType.WAKEUP_TIME;
            if (prev === tleStart && (nextDelineatorType === tleStart || nextDelineatorType === tleEnd || nextDelineatorType === faTime)) {
                intersects = true;
            }
        }
        return intersects;
    }


    private _determineCase(entry: TimelogEntryItem): TLEFFormCase {
        let formCase: TLEFFormCase;
        const startTime: moment.Moment = entry.startTime;
        const endTime: moment.Moment = entry.endTime;
        const now: moment.Moment = moment(this._clock).startOf('minute');
        const isPrevious: boolean = endTime.isBefore(now);
        const isFuture: boolean = startTime.isAfter(now);
        if (isPrevious) {
            if (entry.isSavedEntry) { formCase = TLEFFormCase.EXISTING_PREVIOUS; }
            else { formCase = TLEFFormCase.NEW_PREVIOUS; }
        } else if (isFuture) {
            if (entry.isSavedEntry) { formCase = TLEFFormCase.EXISTING_FUTURE; }
            else { formCase = TLEFFormCase.NEW_FUTURE; }
        } else {
            if (entry.isSavedEntry) {
                formCase = TLEFFormCase.EXISTING_CURRENT;
            } else if (!entry.isSavedEntry) {
                if (now.isSame(startTime)) { formCase = TLEFFormCase.NEW_CURRENT_FUTURE; }
                else if (now.isAfter(startTime)) { formCase = TLEFFormCase.NEW_CURRENT; }
            }
        }
        // console.log("CASE IS: " + formCase)
        return formCase;
    }

    private _closeForm() {
        this._changesMadeTLE$.next(null);
        this._currentlyOpenTLEFItem$.next(null);
        // this._formCase = null;
        // this._tlefIsOpen$.next(false);
    }

    /**
     * Subscribe to the toolbox Close (X) button.
     */
    private _setToolboxSub() {
        this.toolboxService.toolIsOpen$.subscribe((toolIsOpen: boolean) => {
            if (toolIsOpen === false) {
                this._closeForm();
            }
        });
    }

}