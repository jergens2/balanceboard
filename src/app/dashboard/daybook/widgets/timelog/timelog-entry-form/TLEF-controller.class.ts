import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import * as moment from 'moment';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { TimelogDelineator } from '../timelog-large-frame/timelog-body/timelog-delineator.class';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { TimelogDisplayGridItem } from '../timelog-large-frame/timelog-body/timelog-display-grid-item.class';
import { TLEFControllerItem } from './TLEF-controller-item.class';
import { TLEFCircleButton } from './tlef-parts/tlef-circle-buttons-bar/tlef-circle-button.class';
import { DaybookTimeSchedule } from '../../../display-manager/daybook-time-schedule/daybook-time-schedule.class';
import { DaybookTimeScheduleItem } from '../../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';
import { ActivityTree } from '../../../../activities/api/activity-tree.class';
import { TLEFBuilder } from './TLEF-builder.class';
import { DaybookUpdateAction } from '../../../display-manager/daybook-update-action.enum';
import { TLEFItemUpdater } from './TLEF-item-updater';

export class TLEFController {

    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _promptToSaveChanges: boolean = false;
    private _tlefItems: TLEFControllerItem[] = [];
    private _currentlyOpenTLEFItem$: BehaviorSubject<TLEFControllerItem> = new BehaviorSubject(null);

    private _activityTree: ActivityTree;
    private _promptStashedItemIndex: number;

    private _isSavingChanges: boolean = false;


    public get formIsOpen(): boolean { return this._currentlyOpenTLEFItem$.getValue() !== null; }
    public get currentlyOpenTLEFItem$(): Observable<TLEFControllerItem> { return this._currentlyOpenTLEFItem$.asObservable(); }
    public get isChanged(): boolean { return this._changesMadeTLE$.getValue() !== null; }
    public get tlefItems(): TLEFControllerItem[] { return this._tlefItems; }
    public get gridBarItems(): TLEFCircleButton[] { return this.tlefItems.map(item => item.circleButton); }
    public get changesMadeTLE$(): Observable<TimelogEntryItem> { return this._changesMadeTLE$.asObservable(); }
    public get changesMadeTLE(): TimelogEntryItem { return this._changesMadeTLE$.getValue(); }
    public get currentlyOpenTLEFItem(): TLEFControllerItem { return this._currentlyOpenTLEFItem$.getValue(); }
    // public get activeIndex(): number { return this.currentlyOpenTLEFItem.itemIndex; }
    public get showDeleteButton(): boolean { return this.currentlyOpenTLEFItem.getInitialTLEValue().isSavedEntry; }
    public get promptToSaveChanges(): boolean { return this._promptToSaveChanges; }
    public get isNew(): boolean {
        return [
            TLEFFormCase.NEW_CURRENT,
            TLEFFormCase.NEW_CURRENT_FUTURE,
            TLEFFormCase.NEW_FUTURE,
            TLEFFormCase.NEW_PREVIOUS
        ].indexOf(this.currentlyOpenTLEFItem.formCase) > -1;
    }

    public get isSavingChanges(): boolean { return this._isSavingChanges; }

    constructor(scheduleDisplayItems: DaybookTimeScheduleItem[], activityTree: ActivityTree) {
        this._activityTree = activityTree;
        const builder: TLEFBuilder = new TLEFBuilder();
        this._tlefItems = builder.buildItems(scheduleDisplayItems, this._activityTree);
    }


    public update(scheduleDisplayItems: DaybookTimeScheduleItem[], action: DaybookUpdateAction) {
        console.log("********* UPDATING TLEF CONTROLLER-  action is: ", action)
        const builder: TLEFBuilder = new TLEFBuilder();
        this._tlefItems = builder.buildItems(scheduleDisplayItems, this._activityTree);

        this.tlefItems.forEach(item => console.log("  " + item.toString()));

        if (this.formIsOpen) {
            this._reopenTLEFItem(action);

        }

    }
    public getIndexOfNowItem(): number {
        const newCurrent = this.tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
        const newCurrentFuture = this.tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT_FUTURE);
        const existingCurrent = this.tlefItems.find(item => item.formCase === TLEFFormCase.EXISTING_CURRENT);
        if (newCurrent) {
            return newCurrent.itemIndex;
        } else if (newCurrentFuture) {
            return newCurrentFuture.itemIndex;
        } else if (existingCurrent) {
            return existingCurrent.itemIndex;
        } else {
            return -1;
        }
    }
    public openItemByIndex(itemIndex: number) {
        console.log("******UPDATING TLEF ITEM BY INDEX: ", itemIndex);
        this.tlefItems.forEach(item => console.log(item.toString()))
        const indexItem = this._tlefItems.find(item => item.itemIndex === itemIndex);
        if (indexItem) {
            this._openTLEFItem(indexItem);
        } else {
            console.log("Error opening TLEF Item by index: " + itemIndex);
        }
    }
    public close() {
        this._isSavingChanges = false;
        this.tlefItems.forEach(item => item.isCurrentlyOpen = false);
        this._changesMadeTLE$.next(null);
        this._currentlyOpenTLEFItem$.next(null);
    }




    public openWakeupTime() { this._openTLEFItem(this._tlefItems[0]); }
    public openFallAsleepTime() { this._openTLEFItem(this._tlefItems[this._tlefItems.length - 1]); }
    public openNewCurrentTimelogEntry() {
        const newCurrentItem = this.tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
        const existingcurrentItem = this.tlefItems.find(item => item.formCase === TLEFFormCase.EXISTING_CURRENT);
        const newCurrentFutureItem = this.tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT_FUTURE);
        if (newCurrentItem) { this._openTLEFItem(newCurrentItem); }
        else if (existingcurrentItem) { this._openTLEFItem(existingcurrentItem); }
        else if (newCurrentFutureItem) { this._openTLEFItem(newCurrentFutureItem); }
        else {
            console.log('Error: Could not find a current item.')
        }
    }
    public onCreateNewTimelogEntry(schedule: DaybookTimeSchedule) {
        console.log("Durrr what does this do?")
    }

    public openTLEDelineator(delineator: TimelogDelineator) {
        const gridItem = this.tlefItems.find((item) => { return item.schedItemStartTime.isSame(delineator.time) });
        if (gridItem) {
            this._openTLEFItem(gridItem);
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

    public makeChangesTLE(changedItem: TimelogEntryItem) {
        this.currentlyOpenTLEFItem.setUnsavedTLEChanges(changedItem);
        this._changesMadeTLE$.next(changedItem);
    }
    public saveChanges() {
        this._isSavingChanges = true;
        this._changesMadeTLE$.next(null);
    }

    public promptContinue() {
        if (this._promptStashedItemIndex) {
            this._changesMadeTLE$.next(null);
            const stashedItem = this.tlefItems.find(item => item.itemIndex === this._promptStashedItemIndex);
            if (stashedItem) {
                this._openTLEFItem(stashedItem);
            }
        }
        this.closeTLEFPrompt();
    }

    public closeTLEFPrompt() {
        this._promptStashedItemIndex = null;
        this._promptToSaveChanges = false;
    }

    private _openTLEFItem(item: TLEFControllerItem) {
        console.log("Opening TLEF Item", item);
        let doOpenItem: boolean = true;
        if (this.currentlyOpenTLEFItem) {
            console.log(" ITS CURRENTLY OPEN")
            if (this.isChanged) {
                this._promptToSaveChanges = true;
                this._promptStashedItemIndex = item.itemIndex;
                doOpenItem = false;
            }
        }
        if (doOpenItem) {
            this._isSavingChanges = false;
            this._changesMadeTLE$.next(null);
            this._setItemCurrentlyOpen(item.itemIndex);
            this._currentlyOpenTLEFItem$.next(item);
        }
    }
    private _reopenTLEFItem(action: DaybookUpdateAction) {
        console.log("WERE IN THE ITEM UPDATER>>>> action is ", action)

        if (action === DaybookUpdateAction.CLOCK_MINUTE) {
            if(this.currentlyOpenTLEFItem.formCase === TLEFFormCase.NEW_CURRENT){

            }else if(this.currentlyOpenTLEFItem.formCase === TLEFFormCase.NEW_CURRENT_FUTURE){
                
            }
        } else if (action === DaybookUpdateAction.DELINEATOR) {

        } else if (action === DaybookUpdateAction.DRAWING) {

        }

        /**
             *  CASE:  NOW time changed.
             *      If the TLEF was open when the clock changed, then update the new time.
             *          if NEW_CURRENT case, then update end time.
             *          if NEW_CURRENT_FUTURE,
             *              and if no changes, then update new start time,
             *              but if there are changes, then don't update the time.
             *
             *
             *  CASE:  NEW DELINEATOR or DELETED DELINEATOR
             *      this will change the indexes by adding or removing one, so we don't want to reopen by index.
             *
             *      IF THE CURRENT ITEM's TIMES HAVE BEEN AFFECTED (the change of delineator caused the item to shrink or expand)
             *          UPDATE NEW TIMES
             * 
             * 
             *  CASE: DRAWING
             *      IF there are changes to existing item, and
             *          IF drawing a new TLE does not interfere with the existing one that is open in terms of times,
             *              then prompt user to save changes.
             *          however, if there is an overlap of any kind, then we'll just obliterate it.
             *      ELSE start drawing
             * 
             *  CASE:  CALENDAR
             *      IF there are changes prompt to save changes, then close
             * 
             */


        return
    }
    private _setItemCurrentlyOpen(itemIndex: number) {
        this._tlefItems.forEach(item => {
            if (item.itemIndex === itemIndex) {
                item.isCurrentlyOpen = true;
            } else {
                item.isCurrentlyOpen = false;
            }
        });
    }

    private _formClosed$: Subject<boolean> = new Subject();
    private _closeForm() {
        this._changesMadeTLE$.next(null);
        this._currentlyOpenTLEFItem$.next(null);
        this._formClosed$.next(true);
    }
    public get onFormClosed$(): Observable<boolean> { return this._formClosed$.asObservable(); }
    /**
     * Subscribe to the toolbox Close (X) button.
     */
    // private _setToolboxSub() {
    //     this._toolboxService.onFormClosed$.subscribe((formClosed: boolean) => {
    //         if (formClosed === true) {
    //             this._closeForm();
    //         }
    //     });
    // }
}
