import { TimelogEntryItem } from "../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { TLEFFormCase } from "./tlef-form-case.enum";
import * as moment from 'moment';
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { DaybookController } from "../../../controller/daybook-controller.class";
import { TimelogDelineator, TimelogDelineatorType } from "../timelog-delineator.class";
import { ToolboxService } from "../../../../../toolbox-menu/toolbox.service";
import { TimelogDisplayGridItem } from "../timelog-display-grid-item.class";
import { ToolType } from "../../../../../toolbox-menu/tool-type.enum";
import { TLEFControllerItem } from "./TLEF-controller-item.class";
import { SleepEntryItem } from "./sleep-entry-form/sleep-entry-item.class";
import { DaybookDisplayUpdate, DaybookDisplayUpdateType } from "../../../controller/items/daybook-display-update.interface";
import { TLEFGridBarItem } from "./tlef-parts/tlef-grid-items-bar/tlef-grid-bar-item.class";
import { ActivityCategoryDefinition } from "../../../../../dashboard/activities/api/activity-category-definition.class";
import { ActivityCategoryDefinitionService } from "../../../../activities/api/activity-category-definition.service";
import { ColorConverter } from "../../../../../shared/utilities/color-converter.class";
import { ColorType } from "../../../../../shared/utilities/color-type.enum";
import { DaybookTimeScheduleStatus } from "../../../api/daybook-time-schedule/daybook-time-schedule-status.enum";
import { TimelogEntryBuilder } from "../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-builder.class";
import { DaybookTimeSchedule } from "../../../api/daybook-time-schedule/daybook-time-schedule.class";

export class TLEFController {

    private _clock: moment.Moment;

    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _promptToSaveChanges: boolean = false;
    private _tlefItems: TLEFControllerItem[] = [];
    private _timeDelineators: TimelogDelineator[] = [];
    private _activeDayController: DaybookController;
    private _currentlyOpenTLEFItem$: BehaviorSubject<TLEFControllerItem> = new BehaviorSubject(null);
    private _daybookSchedule: DaybookTimeSchedule;

    private toolboxService: ToolboxService;

    private _activitiesService: ActivityCategoryDefinitionService;
    private _stachedItem: TLEFControllerItem;

    constructor(timeDelineators: TimelogDelineator[], daybookSchedule: DaybookTimeSchedule, activeDayController: DaybookController,
        clock: moment.Moment, toolboxService: ToolboxService, activitiesService: ActivityCategoryDefinitionService) {
        this._timeDelineators = timeDelineators;
        this._daybookSchedule = daybookSchedule;
        this._activeDayController = activeDayController;
        this.toolboxService = toolboxService;
        this._activitiesService = activitiesService;

        this._clock = moment(clock);
        this._buildItems();
        this._setToolboxSub();

    }

    public get formIsOpen(): boolean { return this._currentlyOpenTLEFItem$.getValue() !== null; }
    public get currentlyOpenTLEFItem$(): Observable<TLEFControllerItem> { return this._currentlyOpenTLEFItem$.asObservable(); }

    public get changesMade(): boolean { return this._changesMadeTLE$.getValue() !== null; }
    public get tlefItems(): TLEFControllerItem[] { return this._tlefItems; }
    public get gridBarItems(): TLEFGridBarItem[] { return this.tlefItems.map(item => item.gridBarItem); }

    public get changesMadeTLE$(): Observable<TimelogEntryItem> { return this._changesMadeTLE$.asObservable(); }
    public get changesMadeTLE(): TimelogEntryItem { return this._changesMadeTLE$.getValue(); }

    public get currentlyOpenTLEFItem(): TLEFControllerItem { return this._currentlyOpenTLEFItem$.getValue(); }

    public get activeIndex(): number { return this.currentlyOpenTLEFItem.itemIndex; }
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

    // public update(timeDelineators: TimelogDelineator[], activeDayController: DaybookController, clock: moment.Moment, update: DaybookDisplayUpdate) {
    //     // console.log("Updating the TLEF Controller by " + update.type + "   - " + clock.format('hh:mm:ss a'))
    //     this._clock = moment(clock);
    //     this._timeDelineators = timeDelineators;
    //     this._activeDayController = activeDayController;
    //     let currentItem: TLEFControllerItem = this.currentlyOpenTLEFItem;
    //     this._buildItems();
    //     if (update.type === DaybookDisplayUpdateType.DRAW_TIMELOG_ENTRY) {
    //         this._drawTimelogEntry();
    //     } else {
    //         if (currentItem) {
    //             if (currentItem.isDrawing) {
    //                 if (update.type !== DaybookDisplayUpdateType.CLOCK) {
    //                     this.toolboxService.closeTool();
    //                 } else {
    //                     this._setActiveItem(currentItem);
    //                 }
    //             } else {
    //                 this._setActiveItem(currentItem);
    //             }
    //         }
    //     }
    // }

    public openWakeupTime() {this._openTLEFItem(this._tlefItems[0]);}

    public openFallAsleepTime() {this._openTLEFItem(this._tlefItems[this._tlefItems.length - 1]);}

    public openNewCurrentTimelogEntry() {
        console.log("opening new current TLE")
        // if (currentTimePosition === DaybookTimePosition.NORMAL) {
        const foundItem = this.tlefItems.find(item => {
            return item.formCase === TLEFFormCase.NEW_CURRENT;
        });
        if (foundItem) {
            this._openTLEFItem(foundItem);
        } else {
            console.log("Could not find NEW_CURRENT item")
        }
        // } else {
        //     console.log("Position is not normal.  Opening new day form.")
        //     this.toolboxService.openNewDayForm();
        // }
    }
    public onCreateNewTimelogEntry(timelogEntry: TimelogEntryItem){
        
    }

    public openTimelogGridItem(gridItem: TimelogDisplayGridItem) {
        /**
         * the TimelogDisplayGridItems should always be up to date / synched with the clock.
         */
        // console.log("opening grid item: " + gridItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm a'));
        // if (currentTimePosition === DaybookTimePosition.NORMAL) {
        console.log("Warning: no time position accounted for in daybook currently. ")
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
        // } else {
        //     //to do:  more stuff here.
        //     console.log("TIME POSITION WAS NOT NORMAL: " + currentTimePosition);
        //     this.toolboxService.openNewDayForm();
        // }
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

    public makeChangesTLE(changedItem: TimelogEntryItem) {
        // console.log("**** Changes made ")
        this._changesMadeTLE$.next(changedItem);
    }
    public clearChanges() {
        this._changesMadeTLE$.next(null);
    }

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
        console.log("Opening TLEF Item", item);
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
                this.toolboxService.openSleepEntryForm();
            } else {
                this.toolboxService.openTimelogEntryForm();
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
        let items: TLEFControllerItem[] = [];
        if (this._timeDelineators.length > 0) {
            // console.log("REBUILDING:")
            // this._timeDelineators.forEach(item => console.log(item.toString()))
            let currentTime: moment.Moment = this._timeDelineators[0].time;
            for (let i = 1; i < this._timeDelineators.length; i++) {
                const startDelineator: TimelogDelineator = this._timeDelineators[i - 1];
                let endDelineator: TimelogDelineator = this._timeDelineators[i];
                let intersects: boolean = this._nowLineIntersects(startDelineator, endDelineator);
                if (intersects) {
                    i++;
                    endDelineator = this._timeDelineators[i];
                }
                let endTime: moment.Moment = endDelineator.time;
                let formCase: TLEFFormCase;
                let timelogEntry: TimelogEntryItem;
                let sleepEntry: SleepEntryItem;
                let isAvailable: boolean = false;
                const availability: DaybookTimeScheduleStatus = this._daybookSchedule.getStatusAtTime(currentTime);
                // console.log(currentTime.format('YYYY-MM-DD hh:mm a ') + " : Availability is: " + availability)
                if (availability === DaybookTimeScheduleStatus.SLEEP) {
                    formCase = TLEFFormCase.SLEEP;
                    // console.log("warning: disable this");
                    sleepEntry = new SleepEntryItem(moment(), moment());
                } else if (availability === DaybookTimeScheduleStatus.ACTIVE) {
                    timelogEntry = this._activeDayController.getTimelogEntryItem(currentTime, endTime);
                    formCase = this._determineCase(timelogEntry);
                } else if (availability === DaybookTimeScheduleStatus.AVAILABLE) {
                    isAvailable = true;
                    timelogEntry = new TimelogEntryItem(currentTime, endTime);
                    formCase = this._determineCase(timelogEntry);
                }
                const tleBuilder: TimelogEntryBuilder = new TimelogEntryBuilder();
                const backgroundColor: string = tleBuilder.getBackgroundColor(timelogEntry, this._activitiesService.activitiesTree);
                let newItem: TLEFControllerItem = new TLEFControllerItem(currentTime, endTime, isAvailable, formCase, timelogEntry, sleepEntry, startDelineator, endDelineator, backgroundColor);
                if (startDelineator.delineatorType === TimelogDelineatorType.DRAWING_TLE_START) {
                    newItem.isDrawing
                }
                items.push(newItem);
                currentTime = moment(endDelineator.time);

            }
        } else {
            console.log("Error with timeDelineators.");
        }
        for (let i = 0; i < items.length; i++) {
            items[i].setItemIndex(i);
        }
        let currentItem = items.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
        if (currentItem) {
            currentItem.setIsCurrent();
        } else {
            currentItem = items.find(item => item.formCase === TLEFFormCase.NEW_CURRENT_FUTURE);
            if (currentItem) {
                currentItem.setIsCurrent();
            } else {
                currentItem = items.find(item => item.formCase === TLEFFormCase.EXISTING_CURRENT);
                if (currentItem) {
                    currentItem.setIsCurrent();
                }
            }
        }
        this._tlefItems = items;
    }

    /**
     * Checks to see if the NOW line is between the start and end of an existing TLE.
     */
    private _nowLineIntersects(startDelineator: TimelogDelineator, endDelineator: TimelogDelineator): boolean {
        let intersects: boolean = false;
        if (endDelineator.delineatorType === TimelogDelineatorType.NOW) {
            if (endDelineator.nowLineCrossesTLE) {
                intersects = true;
            }
            // const prev = startDelineator.delineatorType;
            // const tleStart = TimelogDelineatorType.TIMELOG_ENTRY_START;
            // const tleEnd = TimelogDelineatorType.TIMELOG_ENTRY_END;
            // const faTime = TimelogDelineatorType.FALLASLEEP_TIME;
            // const wuTime = TimelogDelineatorType.WAKEUP_TIME;
            // if (prev === tleStart && (nextDelineatorType === tleStart || nextDelineatorType === tleEnd || nextDelineatorType === faTime)) {
            //     intersects = true;
            // }
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

    private _formClosed$: Subject<boolean> = new Subject();
    private _closeForm() {
        this._changesMadeTLE$.next(null);
        this._currentlyOpenTLEFItem$.next(null);
        // this._shakeTemporaryItems();
        this._formClosed$.next(true);
        // this._formCase = null;
        // this._tlefIsOpen$.next(false);
    }
    public get onFormClosed$(): Observable<boolean> { return this._formClosed$.asObservable(); }

    
    /**
     * Subscribe to the toolbox Close (X) button.
     */
    private _setToolboxSub() {
        this.toolboxService.onFormClosed$.subscribe((formClosed: boolean) => {
            if (formClosed === true) {
                this._closeForm();
            }
        });
    }

}