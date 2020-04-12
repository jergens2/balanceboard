import { TimelogEntryItem } from "../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class";
import { TLEFFormCase } from "./tlef-form-case.enum";
import * as moment from 'moment';
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { DaybookController } from "../../../controller/daybook-controller.class";
import { TimelogDelineator, TimelogDelineatorType } from "../timelog-delineator.class";
import { ToolboxService } from "../../../../../toolbox-menu/toolbox.service";
import { DaybookTimePosition } from "../../../daybook-time-position-form/daybook-time-position.enum";
import { TimelogDisplayGridItem } from "../timelog-display-grid-item.class";
import { ToolType } from "../../../../../toolbox-menu/tool-type.enum";
import { TLEFControllerItem } from "./TLEF-controller-item.class";
import { SleepEntryItem } from "./sleep-entry-form/sleep-entry-item.class";
import { DaybookDisplayUpdate, DaybookDisplayUpdateType } from "../../../controller/items/daybook-display-update.interface";
import { TLEFGridBarItem } from "./tlef-parts/tlef-grid-items-bar/tlef-grid-bar-item.class";
import { DaybookAvailabilityType } from "../../../controller/items/daybook-availability-type.enum";
import { ActivityCategoryDefinition } from "../../../../../dashboard/activities/api/activity-category-definition.class";
import { ActivityTree } from "../../../../../dashboard/activities/api/activity-tree.class";
import { ActivityCategoryDefinitionService } from "../../../../activities/api/activity-category-definition.service";
import { ColorConverter } from "../../../../../shared/utilities/color-converter.class";
import { ColorType } from "../../../../../shared/utilities/color-type.enum";

export class TLEFController {

    private _clock: moment.Moment;

    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _promptToSaveChanges: boolean = false;
    private _tlefItems: TLEFControllerItem[] = [];
    private _timeDelineators: TimelogDelineator[] = [];
    private _activeDayController: DaybookController;
    private _currentlyOpenTLEFItem$: BehaviorSubject<TLEFControllerItem> = new BehaviorSubject(null);

    private toolboxService: ToolboxService;

    private _activitiesService: ActivityCategoryDefinitionService;

    constructor(timeDelineators: TimelogDelineator[], activeDayController: DaybookController,
        clock: moment.Moment, toolboxService: ToolboxService, activitiesService: ActivityCategoryDefinitionService) {
        this._timeDelineators = timeDelineators;
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
    // public get showDeleteButton(): boolean { return this._initialValue.isSavedEntry; }
    // public get formCase(): TLEFFormCase { return this._formCase; }

    public get tlefItems(): TLEFControllerItem[] { return this._tlefItems; }
    public get gridBarItems(): TLEFGridBarItem[] { return this.tlefItems.map(item => item.gridBarItem); }

    public get changesMadeTLE$(): Observable<TimelogEntryItem> { return this._changesMadeTLE$.asObservable(); }
    public get changesMadeTLE(): TimelogEntryItem { return this._changesMadeTLE$.getValue(); }

    public get currentlyOpenTLEFItem(): TLEFControllerItem { return this._currentlyOpenTLEFItem$.getValue(); }

    // public get activeItem(): TLEFControllerItem { return this._tlefItems.find(item => item.isActive); }
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

    public update(timeDelineators: TimelogDelineator[], activeDayController: DaybookController, clock: moment.Moment, update: DaybookDisplayUpdate) {
        // console.log("Updating the TLEF Controller by " + update.type + "   - " + clock.format('hh:mm:ss a'))
        this._clock = moment(clock);
        this._timeDelineators = timeDelineators;
        this._activeDayController = activeDayController;


        let currentItem: TLEFControllerItem = this.currentlyOpenTLEFItem;
        this._buildItems();
        if (update.type === DaybookDisplayUpdateType.DRAW_TIMELOG_ENTRY) {
            this._drawTimelogEntry();
        } else {
            if (currentItem) {
                this._setActiveItem(currentItem);
            }
        }

        // if (update.type === DaybookDisplayUpdateType.CLOCK) {
        //     if (this.formIsOpen) {
        //     } else {
        //     }
        // } else {
        // }
    }


    private _setActiveItem(activeItem: TLEFControllerItem) {
        if (activeItem) {
            this._tlefItems.forEach(tlefItem => {
                if (tlefItem.isSame(activeItem)) {
                    tlefItem.setAsActive();
                } else {
                    tlefItem.setAsNotActive();
                }
            });
        } else {
            console.log("error: null activeItem provided")
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


    public openWakeupTime() {
        this._openTLEFItem(this._tlefItems[0]);
    }

    public openFallAsleepTime() {
        this._openTLEFItem(this._tlefItems[this._tlefItems.length - 1]);
    }


    private _drawTimelogEntry() {
        const foundItem = this.tlefItems.find(item => item.startDelineator.delineatorType === TimelogDelineatorType.DRAWING_TLE_START)
        if (foundItem) {
            this._openTLEFItem(foundItem);
            this.toolboxService.openTool(ToolType.TIMELOG_ENTRY);

            // if (this.currentlyOpenTLEFItem) {
            //     this._setActiveItem(foundItem);
            // } else {
            //     this._openTLEFItem(foundItem);
            //     this.toolboxService.openTool(ToolType.TIMELOG_ENTRY);
            // }


        } else {
            console.log("Error finding item to draw")
        }

    }

    public openNewCurrentTimelogEntry(currentTimePosition: DaybookTimePosition, newCurrentTLE: TimelogEntryItem) {
        if (currentTimePosition === DaybookTimePosition.NORMAL) {
            const foundItem = this.tlefItems.find(item => {
                return item.formCase === TLEFFormCase.NEW_CURRENT;
            });
            if (foundItem) {
                this._openTLEFItem(foundItem);
            } else {
                console.log("Could not find NEW_CURRENT item")
            }
        } else {
            console.log("Position is not normal.  Opening new day form.")
            this.toolboxService.openNewDayForm();
        }
    }

    public openTimelogGridItem(gridItem: TimelogDisplayGridItem, currentTimePosition: DaybookTimePosition) {
        /**
         * the TimelogDisplayGridItems should always be up to date / synched with the clock.
         */
        // console.log("opening grid item: " + gridItem.startTime.format('YYYY-MM-DD hh:mm a') + " to " + gridItem.endTime.format('YYYY-MM-DD hh:mm a'));
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
        } else {
            //to do:  more stuff here.
            console.log("TIME POSITION WAS NOT NORMAL, so therefore opening the Daybook form by the toolservice.")
            this.toolboxService.openNewDayForm();
        }
    }

    private _openTLEFItem(item: TLEFControllerItem) {
        // console.log("Opening TLEF Item", item);
        let openItem: boolean = true;
        if (this.currentlyOpenTLEFItem) {
            if (this.changesMade) {
                this._promptToSaveChanges = true;
                openItem = false;
            }
        }
        if (openItem) {
            this._setActiveItem(item);
            this._currentlyOpenTLEFItem$.next(item);

            if (item.formCase === TLEFFormCase.SLEEP) {
                this.toolboxService.openSleepEntryForm();
            } else {
                this.toolboxService.openTimelogEntryForm();
            }
        }

    }


    public makeChangesTLE(changedItem: TimelogEntryItem) {
        console.log("**** Changes made ")
        this._changesMadeTLE$.next(changedItem);
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

                const availability: DaybookAvailabilityType = this._activeDayController.getDaybookAvailability(currentTime, endTime);
                // console.log(currentTime.format('YYYY-MM-DD hh:mm a ') + " : Availability is: " + availability)
                if (availability === DaybookAvailabilityType.SLEEP) {
                    formCase = TLEFFormCase.SLEEP;
                    sleepEntry = this._activeDayController.getSleepItem(currentTime, endTime);
                } else if (availability === DaybookAvailabilityType.TIMELOG_ENTRY) {
                    timelogEntry = this._activeDayController.getTimelogEntryItem(currentTime, endTime);
                    formCase = this._determineCase(timelogEntry);
                } else if (availability === DaybookAvailabilityType.AVAILABLE) {
                    isAvailable = true;
                    timelogEntry = new TimelogEntryItem(currentTime, endTime);
                    formCase = this._determineCase(timelogEntry);
                }
                let backgroundColor: string = this._getBackgroundColor(timelogEntry);
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
        // console.log("TLEF ITEMS REBUILT:")
        // this._tlefItems.forEach(item => console.log(item.toString()))
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

    // private _shakeTemporaryItems(){

    //     if(this._tlefItems.findIndex(item => item.isDrawing) > -1){ 
    //         const newArray = [];
    //         this._tlefItems.forEach(item => {
    //             if(!item.isDrawing){ newArray.push(item); }
    //         })
    //         this._tlefItems = newArray;
    //     }else{

    //     }

    // }



    private _getBackgroundColor(timelogEntry: TimelogEntryItem): string {
        let backgroundColor: string = "";
        if (timelogEntry) {
            if (timelogEntry.timelogEntryActivities.length > 0) {
                let topActivitySet: boolean = false;
                timelogEntry.timelogEntryActivities.sort((a1, a2) => {
                    if (a1.percentage > a2.percentage) return -1;
                    else if (a1.percentage < a2.percentage) return 1;
                    else return 0;
                }).forEach((activityEntry) => {
                    let foundActivity: ActivityCategoryDefinition = this._activitiesService.findActivityByTreeId(activityEntry.activityTreeId);
                    let durationMS: number = (activityEntry.percentage * timelogEntry.durationMilliseconds) / 100;
                    let durationMinutes: number = durationMS / (60 * 1000);
                    if (!topActivitySet) {
                        topActivitySet = true;
                        const alpha = 0.2;
                        backgroundColor = ColorConverter.convert(foundActivity.color, ColorType.RGBA, alpha);
                    }

                });
            }
        }
        return backgroundColor;
    }


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