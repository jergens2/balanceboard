import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import * as moment from 'moment';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { TimelogDelineator } from '../timelog-large-frame/timelog-body/timelog-delineator.class';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { TimelogDisplayGridItem } from '../timelog-large-frame/timelog-body/timelog-display-grid-item.class';
import { TLEFControllerItem } from './TLEF-controller-item.class';
import { TLEFCircleButton } from './tlef-parts/tlef-circle-buttons-bar/tlef-circle-button.class';
import { DaybookTimeSchedule } from '../../../api/daybook-time-schedule/daybook-time-schedule.class';
import { DaybookTimeScheduleItem } from '../../../api/daybook-time-schedule/daybook-time-schedule-item.class';
import { ActivityTree } from '../../../../activities/api/activity-tree.class';
import { TLEFBuilder } from './TLEF-builder.class';

export class TLEFController {

    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _promptToSaveChanges: boolean = false;
    private _tlefItems: TLEFControllerItem[] = [];
    private _currentlyOpenTLEFItem$: BehaviorSubject<TLEFControllerItem> = new BehaviorSubject(null);

    private _activityTree: ActivityTree;
    private _stachedItem: TLEFControllerItem;


    public get formIsOpen(): boolean { return this._currentlyOpenTLEFItem$.getValue() !== null; }
    public get currentlyOpenTLEFItem$(): Observable<TLEFControllerItem> { return this._currentlyOpenTLEFItem$.asObservable(); }
    public get changesMade(): boolean { return this._changesMadeTLE$.getValue() !== null; }
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

    constructor(scheduleDisplayItems: DaybookTimeScheduleItem[], activityTree: ActivityTree) {
        this._activityTree = activityTree;
        const builder: TLEFBuilder = new TLEFBuilder();
        this._tlefItems = builder.buildItems(scheduleDisplayItems, this._activityTree);
    }


    public update(scheduleDisplayItems: DaybookTimeScheduleItem[]) {
        const builder: TLEFBuilder = new TLEFBuilder();
        this._tlefItems = builder.buildItems(scheduleDisplayItems, this._activityTree);
    }
    public openItemByIndex(itemIndex: number) {
        const indexItem = this._tlefItems.find(item => item.itemIndex === itemIndex);
        if (indexItem) {
            if(this.formIsOpen){
                console.log("Form was already open")
            }else{
                this._openTLEFItem(indexItem);
            }
           
        } else {
            console.log("Error opening TLEF Item by index: " + itemIndex);
        }



    }
    public close(){
        this.tlefItems.forEach(item => item.isCurrentlyOpen = false);
        
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
        const gridItem = this.tlefItems.find((item) => { return item.startTime.isSame(delineator.time) });
        if (gridItem) {
            this._openTLEFItem(gridItem);
        }

    }
    public openTimelogGridItem(gridItem: TimelogDisplayGridItem) {
        console.log("durrrr this is disabled.")
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
    public onClickGridBarItem(gridItem: TLEFCircleButton) {

    }
    public makeChangesTLE(changedItem: TimelogEntryItem) {
        this.currentlyOpenTLEFItem.setUnsavedTLEChanges(changedItem);
        this._changesMadeTLE$.next(changedItem);
    }
    public clearChanges() { this._changesMadeTLE$.next(null); }

    public promptContinue() {
        if (this._stachedItem) {
            this._changesMadeTLE$.next(null);
            this._openTLEFItem(this._stachedItem);
        }
        this.closeTLEFPrompt();
    }
    public closeTLEFPrompt() {
        this._stachedItem = null;
        this._promptToSaveChanges = false;
    }

    private _openTLEFItem(item: TLEFControllerItem) {
        console.log("Opening TLEF Item", item);
        let doOpenItem: boolean = true;
        if (this.currentlyOpenTLEFItem) {
            if (this.changesMade) {
                this._promptToSaveChanges = true;
                this._stachedItem = item;
                doOpenItem = false;
            }
        }
        if (doOpenItem) {
            this._changesMadeTLE$.next(null);
            this._setItemCurrentlyOpen(item.itemIndex);
            this._currentlyOpenTLEFItem$.next(item);
        }
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
