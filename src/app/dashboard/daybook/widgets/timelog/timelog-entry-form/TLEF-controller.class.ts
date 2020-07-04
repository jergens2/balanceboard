import { TimelogEntryItem } from "../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { TLEFFormCase } from "./tlef-form-case.enum";
import * as moment from 'moment';
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { DaybookController } from "../../../controller/daybook-controller.class";
import { TimelogDelineator, TimelogDelineatorType } from "../timelog-delineator.class";
import { ToolboxService } from "../../../../../toolbox-menu/toolbox.service";
import { TimelogDisplayGridItem } from "../timelog-display-grid-item.class";
import { TLEFControllerItem } from "./TLEF-controller-item.class";
import { SleepEntryItem } from "./sleep-entry-form/sleep-entry-item.class";
import { TLEFGridBarItem } from "./tlef-parts/tlef-grid-items-bar/tlef-grid-bar-item.class";
import { ActivityCategoryDefinitionService } from "../../../../activities/api/activity-category-definition.service";
import { DaybookTimeScheduleStatus } from "../../../api/daybook-time-schedule/daybook-time-schedule-status.enum";
import { TimelogEntryBuilder } from "../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class";
import { DaybookTimeSchedule } from "../../../api/daybook-time-schedule/daybook-time-schedule.class";

export class TLEFController {

    private _clock: moment.Moment;
    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _promptToSaveChanges: boolean = false;
    private _tlefItems: TLEFControllerItem[] = [];
    private _activeDayController: DaybookController;
    private _currentlyOpenTLEFItem$: BehaviorSubject<TLEFControllerItem> = new BehaviorSubject(null);
    private _daybookSchedule: DaybookTimeSchedule;
    private _activitiesService: ActivityCategoryDefinitionService;
    private _stachedItem: TLEFControllerItem;
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _toolboxService: ToolboxService;

    constructor(daybookSchedule: DaybookTimeSchedule, activeDayController: DaybookController,
        clock: moment.Moment, toolboxService: ToolboxService, activitiesService: ActivityCategoryDefinitionService) {

        this._daybookSchedule = daybookSchedule;
        this._activeDayController = activeDayController;
        this._toolboxService = toolboxService;
        this._activitiesService = activitiesService;

        this._startTime = moment(this._daybookSchedule.startTime);
        this._endTime = moment(this._daybookSchedule.endTime);
        this._clock = moment(clock);
        this._buildItems();
        this._setToolboxSub();

    }

    private get _timeDelineators(): TimelogDelineator[] { return this._daybookSchedule.displayDelineators; }
    public get formIsOpen(): boolean { return this._currentlyOpenTLEFItem$.getValue() !== null; }
    public get currentlyOpenTLEFItem$(): Observable<TLEFControllerItem> { return this._currentlyOpenTLEFItem$.asObservable(); }
    public get changesMade(): boolean { return this._changesMadeTLE$.getValue() !== null; }
    public get tlefItems(): TLEFControllerItem[] { return this._tlefItems; }
    public get gridBarItems(): TLEFGridBarItem[] { return this.tlefItems.map(item => item.gridBarItem); }
    public get changesMadeTLE$(): Observable<TimelogEntryItem> { return this._changesMadeTLE$.asObservable(); }
    public get changesMadeTLE(): TimelogEntryItem { return this._changesMadeTLE$.getValue(); }
    public get currentlyOpenTLEFItem(): TLEFControllerItem { return this._currentlyOpenTLEFItem$.getValue(); }
    // public get activeIndex(): number { return this.currentlyOpenTLEFItem.itemIndex; }
    public get showDeleteButton(): boolean { return this.currentlyOpenTLEFItem.getInitialTLEValue().isSavedEntry; }
    public get promptToSaveChanges(): boolean { return this._promptToSaveChanges; }
    public get isNew(): boolean {
        const isNew = [
            TLEFFormCase.NEW_CURRENT,
            TLEFFormCase.NEW_CURRENT_FUTURE,
            TLEFFormCase.NEW_FUTURE,
            TLEFFormCase.NEW_PREVIOUS
        ].indexOf(this.currentlyOpenTLEFItem.formCase) > -1;
        return isNew;
    }

    public openWakeupTime() { this._openTLEFItem(this._tlefItems[0]); }
    public openFallAsleepTime() { this._openTLEFItem(this._tlefItems[this._tlefItems.length - 1]); }
    public openNewCurrentTimelogEntry() {
        console.log("opening new current TLE")
        const foundItem = this.tlefItems.find(item => { return item.formCase === TLEFFormCase.NEW_CURRENT; });
        if (foundItem) { this._openTLEFItem(foundItem); }
        else { console.log("Could not find NEW_CURRENT item") }
    }
    public onCreateNewTimelogEntry(schedule: DaybookTimeSchedule) {
        this._daybookSchedule = schedule;
        this._buildItems();
        const gridItem = this.tlefItems.find((item) => { return item.isDrawing });
        if (gridItem) { this._openTLEFItem(gridItem); }
        else { console.log("Error drawing new timelog entry: No grid item"); }
    }

    public openTimelogGridItem(gridItem: TimelogDisplayGridItem) {
        // console.log("opening grid item: " + gridItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm a'));
        if (gridItem.isMerged) {
            if (gridItem.timelogEntries.length >= 2) {
                let biggest = gridItem.timelogEntries[0];
                gridItem.timelogEntries.forEach((item) => {
                    if (item.durationMilliseconds > biggest.durationMilliseconds) {
                        biggest = item;
                    }
                });
                const foundItem = this.tlefItems.find(item => {
                    return item.startTime.isSameOrAfter(biggest.startTime) && item.endTime.isSame(biggest.endTime);
                    // return item.isTLEItem && item.startTime.isSameOrAfter(biggest.startTime) && item.endTime.isSame(biggest.endTime);
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
                return item.startTime.isSame(gridItem.startTime) && item.endTime.isSame(gridItem.endTime);
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
    }

    public goLeft() {
        const activeItem = this.currentlyOpenTLEFItem;
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
        const activeItem = this.currentlyOpenTLEFItem;
        let currentIndex = -1;
        if (activeItem) {
            currentIndex = this._tlefItems.indexOf(activeItem);
        }
        if (currentIndex < this._tlefItems.length - 1) {
            const openItem = this._tlefItems[currentIndex + 1];
            this._openTLEFItem(openItem);
        }
    }
    public onClickGridBarItem(gridItem: TLEFGridBarItem) {
        this._tlefItems.forEach((item) => {
            if (item.gridBarItem.startTime.isSame(gridItem.startTime) && item.gridBarItem.endTime.isSame(gridItem.endTime)) {
                this._openTLEFItem(item);
            }
        });
    }
    public makeChangesTLE(changedItem: TimelogEntryItem) {this._changesMadeTLE$.next(changedItem);}
    public clearChanges() {this._changesMadeTLE$.next(null);}
    public closeTLEFPrompt() {
        // console.log("Closing prompt");
        this._promptToSaveChanges = false;
        this._changesMadeTLE$.next(null);
        if (this._stachedItem) {
            this._openTLEFItem(this._stachedItem);
        } else {
            console.log("Error: no stached item");
        }
        this._stachedItem = null;
    }
    private _openTLEFItem(item: TLEFControllerItem) {
        // console.log("Opening TLEF Item", item);
        let openItem: boolean = true;
        if (this.currentlyOpenTLEFItem) {
            if (this.changesMade) {
                this._promptToSaveChanges = true;
                this._stachedItem = item;
                openItem = false;
            }
        }
        if (openItem) {
            this._changesMadeTLE$.next(null);
            this._setActiveItem(item);
            this._currentlyOpenTLEFItem$.next(item);
            if (item.formCase === TLEFFormCase.SLEEP) {
                this._toolboxService.openSleepEntryForm();
            } else {
                this._toolboxService.openTimelogEntryForm();
            }
        }
    }
    private _setActiveItem(activeItem: TLEFControllerItem) {
        if (activeItem) {
            let similarItemFound = false;
            this._tlefItems.forEach(tlefItem => {
                if (tlefItem.isSame(activeItem)) {
                    tlefItem.setAsActive();
                } else {
                    if (tlefItem.isSimilar(activeItem) && !similarItemFound) {
                        tlefItem.setAsActive();
                        similarItemFound = true;
                    } else {
                        tlefItem.setAsNotActive();
                    }
                }
            });
        } else {
            console.log("error: null activeItem provided")
        }
    }
    private _buildItems() {
        const drawStart = this._timeDelineators.find(item => item.delineatorType === TimelogDelineatorType.DRAWING_TLE_START);
        const drawEnd = this._timeDelineators.find(item => item.delineatorType === TimelogDelineatorType.DRAWING_TLE_END);
        let items: TLEFControllerItem[] = this._daybookSchedule.getItemsInRange(this._startTime, this._endTime)
            .map(item => {
                const startTime = item.startTime;
                const endTime = item.endTime;
                const status = item.status;
                let formCase: TLEFFormCase;
                let timelogEntry: TimelogEntryItem;
                let sleepEntry: SleepEntryItem;
                let isAvailable: boolean = false;
                let isDrawing: boolean = false;
                if (status === DaybookTimeScheduleStatus.SLEEP) {
                    formCase = TLEFFormCase.SLEEP;
                    sleepEntry = new SleepEntryItem(moment(), moment());
                } else if (status === DaybookTimeScheduleStatus.ACTIVE) {
                    if (drawStart && drawEnd) {
                        if (drawStart.time.isSame(startTime)) {
                            isDrawing = true;
                        }
                    }
                    if (isDrawing) {
                        timelogEntry = new TimelogEntryItem(drawStart.time, drawEnd.time);
                        formCase = this._determineCase(timelogEntry);
                    } else {
                        timelogEntry = this._activeDayController.getTimelogEntryItem(startTime, endTime);
                        formCase = this._determineCase(timelogEntry);
                    }
                } else if (status === DaybookTimeScheduleStatus.AVAILABLE) {
                    isAvailable = true;
                    timelogEntry = new TimelogEntryItem(startTime, endTime);
                    formCase = this._determineCase(timelogEntry);
                }
                const tleBuilder: TimelogEntryBuilder = new TimelogEntryBuilder();
                const backgroundColor: string = tleBuilder.getBackgroundColor(timelogEntry, this._activitiesService.activitiesTree);
                let newItem: TLEFControllerItem = new TLEFControllerItem(startTime, endTime, isAvailable, isDrawing, formCase, timelogEntry, sleepEntry, backgroundColor);
                return newItem;
            });
        this._tlefItems = items;
        // console.log("TLEF CONTROLLER ITEMS REBUILT")
        // this._tlefItems.forEach(item => console.log("   " + item.toString()))
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
    private _formClosed$: Subject<boolean> = new Subject();
    private _closeForm() {
        this._changesMadeTLE$.next(null);
        this._currentlyOpenTLEFItem$.next(null);
        // this._shakeTemporaryItems();
        this._formClosed$.next(true);
        this._buildItems();
    }
    public get onFormClosed$(): Observable<boolean> { return this._formClosed$.asObservable(); }
    /**
     * Subscribe to the toolbox Close (X) button.
     */
    private _setToolboxSub() {
        this._toolboxService.onFormClosed$.subscribe((formClosed: boolean) => {
            if (formClosed === true) {
                this._closeForm();
            }
        });
    }

    /**
     * Checks to see if the NOW line is between the start and end of an existing TLE.
     */
    // private _nowLineIntersects(startDelineator: TimelogDelineator, endDelineator: TimelogDelineator): boolean {
    //     let intersects: boolean = false;
    //     if (endDelineator.delineatorType === TimelogDelineatorType.NOW) {
    //         if (endDelineator.nowLineCrossesTLE) {
    //             intersects = true;
    //         }
    //         // const prev = startDelineator.delineatorType;
    //         // const tleStart = TimelogDelineatorType.TIMELOG_ENTRY_START;
    //         // const tleEnd = TimelogDelineatorType.TIMELOG_ENTRY_END;
    //         // const faTime = TimelogDelineatorType.FALLASLEEP_TIME;
    //         // const wuTime = TimelogDelineatorType.WAKEUP_TIME;
    //         // if (prev === tleStart && (nextDelineatorType === tleStart || nextDelineatorType === tleEnd || nextDelineatorType === faTime)) {
    //         //     intersects = true;
    //         // }
    //     }
    //     return intersects;
    // }

    // private _buildItems() {
    // let items: TLEFControllerItem[] = [];
    // if (this._timeDelineators.length > 0) {
    //     console.log("REBUILDING:")
    //     this._timeDelineators.forEach(item => console.log("     "  + item.toString()))
    //     let currentTime: moment.Moment = this._timeDelineators[0].time;
    //     for (let i = 1; i < this._timeDelineators.length; i++) {
    //         const startDelineator: TimelogDelineator = this._timeDelineators[i - 1];
    //         let endDelineator: TimelogDelineator = this._timeDelineators[i];
    //         let intersects: boolean = this._nowLineIntersects(startDelineator, endDelineator);
    //         if (intersects) {
    //             i++;
    //             endDelineator = this._timeDelineators[i];
    //         }
    //         let endTime: moment.Moment = endDelineator.time;
    //         let formCase: TLEFFormCase;
    //         let timelogEntry: TimelogEntryItem;
    //         let sleepEntry: SleepEntryItem;
    //         let isAvailable: boolean = false;
    //         const availability: DaybookTimeScheduleStatus = this._daybookSchedule.getStatusAtTime(currentTime);
    //         if (availability === DaybookTimeScheduleStatus.SLEEP) {
    //             formCase = TLEFFormCase.SLEEP;
    //             sleepEntry = new SleepEntryItem(moment(), moment());
    //         } else if (availability === DaybookTimeScheduleStatus.ACTIVE) {
    //             console.log("WERE ACTIVE: " + this._timeDelineators[i].toString())
    //             if(this._timeDelineators[i].delineatorType === TimelogDelineatorType.DRAWING_TLE_START){
    //                 if(this._timeDelineators[i-1].delineatorType === TimelogDelineatorType.DRAWING_TLE_START){
    //                     const drawStart = this._timeDelineators[i-1].time;
    //                     const drawEnd = this._timeDelineators[i].time;
    //                     timelogEntry = new TimelogEntryItem(drawStart, drawEnd);
    //                     formCase = this._determineCase(timelogEntry);
    //                 }else{
    //                     console.log("Error with delineators;")
    //                 }
    //             }else{
    //                 console.log("TRYING TO GET TIMELOG ENTRY FOR TIMES: ")
    //                 console.log("    " + currentTime.format('hh:mm a') + " to " + endTime.format('hh:mm a'))
    //                 timelogEntry = this._activeDayController.getTimelogEntryItem(currentTime, endTime);
    //                 formCase = this._determineCase(timelogEntry);
    //             }
    //         } else if (availability === DaybookTimeScheduleStatus.AVAILABLE) {
    //             isAvailable = true;
    //             timelogEntry = new TimelogEntryItem(currentTime, endTime);
    //             formCase = this._determineCase(timelogEntry);
    //         }
    //         const tleBuilder: TimelogEntryBuilder = new TimelogEntryBuilder();
    //         const backgroundColor: string = tleBuilder.getBackgroundColor(timelogEntry, this._activitiesService.activitiesTree);
    //         let newItem: TLEFControllerItem = new TLEFControllerItem(currentTime, endTime, isAvailable, formCase, timelogEntry, sleepEntry, startDelineator, endDelineator, backgroundColor);
    //         if (startDelineator.delineatorType === TimelogDelineatorType.DRAWING_TLE_START) {
    //             newItem.isDrawing;
    //         }
    //         items.push(newItem);
    //         currentTime = moment(endDelineator.time);

    //     }
    // } else {
    //     console.log("Error with timeDelineators.");
    // }
    // for (let i = 0; i < items.length; i++) {
    //     items[i].setItemIndex(i);
    // }
    // }

}