import { TimelogEntryItem } from '../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { TLEFFormCase } from './tlef-form-case.enum';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { TimelogDelineator } from '../timelog-large-frame/timelog-body/timelog-delineator.class';
import { TLEFControllerItem } from './TLEF-controller-item.class';
import { TLEFCircleButton } from './tlef-parts/tlef-circle-buttons-bar/tlef-circle-button.class';
import { DaybookTimeSchedule } from '../../../display-manager/daybook-time-schedule/daybook-time-schedule.class';
import { DaybookTimeScheduleItem } from '../../../display-manager/daybook-time-schedule/daybook-time-schedule-item.class';
import { ActivityDefinitionTree } from '../../../../activities/api/activity-definition-tree.class';
import { TLEFBuilder } from './TLEF-builder.class';
import { DaybookUpdateAction } from '../../../display-manager/daybook-update-action.enum';
import { TimelogEntryActivity } from '../../../daybook-day-item/data-items/timelog-entry-activity.interface';
import * as moment from 'moment';

export class TLEFController {

    private _changesMadeTLE$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);
    private _promptToSaveChanges: boolean = false;
    private _tlefItems: TLEFControllerItem[] = [];
    private _currentlyOpenTLEFItem$: BehaviorSubject<{ item: TLEFControllerItem, isSameItem: boolean }> = new BehaviorSubject(null);
    private _activityTree: ActivityDefinitionTree;
    private _promptStashedItemIndex: number;
    private _isSavingChanges: boolean = false;

    public get formIsOpen(): boolean { return this._currentlyOpenTLEFItem$.getValue() !== null; }
    public get currentlyOpenTLEFItem$(): Observable<{ item: TLEFControllerItem, isSameItem: boolean }> {
        return this._currentlyOpenTLEFItem$.asObservable();
    }
    public get tlefItems(): TLEFControllerItem[] { return this._tlefItems; }
    public get tlefCircleButtons(): TLEFCircleButton[] { return this.tlefItems.map(item => item.circleButton); }
    public get changesMadeTLE$(): Observable<TimelogEntryItem> { return this._changesMadeTLE$.asObservable(); }
    public get changesMadeTLE(): TimelogEntryItem { return this._changesMadeTLE$.getValue(); }
    public get isChanged(): boolean { return this.changesMadeTLE !== null; }
    public get currentlyOpenTLEFItem(): { item: TLEFControllerItem, isSameItem: boolean } {
        return this._currentlyOpenTLEFItem$.getValue();
    }
    public get showDeleteButton(): boolean { return this.currentlyOpenTLEFItem.item.getInitialTLEValue().isSavedEntry; }
    public get promptToSaveChanges(): boolean { return this._promptToSaveChanges; }
    public get isNew(): boolean {
        return [
            TLEFFormCase.NEW_CURRENT,
            TLEFFormCase.NEW_CURRENT_FUTURE,
            TLEFFormCase.NEW_FUTURE,
            TLEFFormCase.NEW_PREVIOUS
        ].indexOf(this.currentlyOpenTLEFItem.item.formCase) > -1;
    }
    public get isSavingChanges(): boolean { return this._isSavingChanges; }

    constructor(scheduleDisplayItems: DaybookTimeScheduleItem[], activityTree: ActivityDefinitionTree) {
        this._activityTree = activityTree;
        const builder: TLEFBuilder = new TLEFBuilder();
        this._tlefItems = builder.buildItems(scheduleDisplayItems, this._activityTree);
    }
    public update(scheduleDisplayItems: DaybookTimeScheduleItem[], action: DaybookUpdateAction) {
        const builder: TLEFBuilder = new TLEFBuilder();
        this._tlefItems = builder.buildItems(scheduleDisplayItems, this._activityTree);
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
        const indexItem = this._tlefItems.find(item => item.itemIndex === itemIndex);
        if (indexItem) {
            this._openTLEFItem(indexItem);
        } else {
            console.log('Error opening TLEF Item by index: ' + itemIndex);
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
        if (newCurrentItem) {
            this._openTLEFItem(newCurrentItem);
        } else if (existingcurrentItem) {
            this._openTLEFItem(existingcurrentItem);
        } else if (newCurrentFutureItem) {
            this._openTLEFItem(newCurrentFutureItem);
        } else {
            console.log('Error: Could not find a current item.')
        }
    }
    public openTLEDelineator(delineator: TimelogDelineator) {
        const gridItem = this.tlefItems.find((item) => {
            return item.schedItemStartTime.isSame(delineator.time)
        });
        if (gridItem) {
            this._openTLEFItem(gridItem);
        }
    }
    public goLeft() {
        const activeItem = this.currentlyOpenTLEFItem;
        let currentIndex = -1;
        if (activeItem) {
            currentIndex = this._tlefItems.indexOf(activeItem.item);
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
            currentIndex = this._tlefItems.indexOf(activeItem.item);
        }
        if (currentIndex < this._tlefItems.length - 1) {
            const openItem = this._tlefItems[currentIndex + 1];
            this._openTLEFItem(openItem);
        }
    }
    public makeChangesToTLETimes(startTime: moment.Moment, endTime: moment.Moment) {
        const currentItem = this.currentlyOpenTLEFItem.item.unsavedChangesTLE;
        currentItem.setStartTime(startTime);
        currentItem.setEndTime(endTime);
        this._makeChangesTLE(currentItem);
    }
    public makeChangesToTLENote(note: string) {
        const currentItem = this.currentlyOpenTLEFItem.item.unsavedChangesTLE;
        currentItem.embeddedNote = note;
        this._makeChangesTLE(currentItem);
    }
    public makeChangesToTLEActivities(activities: TimelogEntryActivity[]) {
        const currentItem = this.currentlyOpenTLEFItem.item.unsavedChangesTLE;
        currentItem.timelogEntryActivities = activities;
        this._makeChangesTLE(currentItem);
    }
    private _makeChangesTLE(changedItem: TimelogEntryItem) {
        this.currentlyOpenTLEFItem.item.setUnsavedTLEChanges(changedItem);
        this._changesMadeTLE$.next(this.currentlyOpenTLEFItem.item.unsavedChangesTLE);
    }
    public saveChanges() {
        this._isSavingChanges = true;
        this._changesMadeTLE$.next(null);
    }
    public onChangesSaved() { this._isSavingChanges = false; }
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
    private _openTLEFItem(item: TLEFControllerItem, overWrite = false) {
        // console.log('Opening TLEF Item', item);
        let doOpenItem: boolean = true;
        if (!overWrite) {
            if (this.currentlyOpenTLEFItem) {
                if (this.isChanged) {
                    this._promptToSaveChanges = true;
                    this._promptStashedItemIndex = item.itemIndex;
                    doOpenItem = false;
                }
            }
        }
        if (doOpenItem) {
            this._isSavingChanges = false;
            this._changesMadeTLE$.next(null);
            this._setItemCurrentlyOpen(item.itemIndex);
            this._currentlyOpenTLEFItem$.next({ item: item, isSameItem: false });
        }
    }
    private _reopenTLEFItem(action: DaybookUpdateAction) {
        if (action === DaybookUpdateAction.CLOCK_MINUTE) {
            /*  CASE:  NOW time changed.
             *      If the TLEF was open when the clock changed, then update the new time.
             *          if NEW_CURRENT case, then update end time.
             *          if NEW_CURRENT_FUTURE,
             *              and if no changes, then update new start time,
             *              but if there are changes, then don't update the time.
            */
            if (this.currentlyOpenTLEFItem.item.formCase === TLEFFormCase.NEW_CURRENT) {
                const existingItem: TLEFControllerItem = this.currentlyOpenTLEFItem.item;
                if (!existingItem.hasUnsavedChanges) {
                    let newEndTime = moment().startOf('minute');
                    const newItemOfType = this.tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT);
                    if (newEndTime.isAfter(newItemOfType.timeLimiter.upperLimit)) {
                        newEndTime = moment(newItemOfType.timeLimiter.upperLimit);
                    }
                    existingItem.changeSchedItemEndTime(newEndTime);
                    newItemOfType.timeLimiter.changeEndTime(newEndTime);
                    existingItem.setTimeLimiter(newItemOfType.timeLimiter);
                    this._isSavingChanges = false;
                    this._setItemCurrentlyOpen(existingItem.itemIndex);
                    this._currentlyOpenTLEFItem$.next({ item: existingItem, isSameItem: true });
                    this._changesMadeTLE$.next(null);
                    existingItem.clearUnsavedChanges();
                } else {
                    // do nothing
                }
            } else if (this.currentlyOpenTLEFItem.item.formCase === TLEFFormCase.NEW_CURRENT_FUTURE) {
                if (!this.currentlyOpenTLEFItem.item.hasUnsavedChanges) {
                    const foundItem = this._tlefItems.find(item => item.formCase === TLEFFormCase.NEW_CURRENT_FUTURE);
                    this._openTLEFItem(foundItem);
                }
            } else {
                // do nothing.
            }
        } else if (action === DaybookUpdateAction.DELINEATOR) {

        } else if (action === DaybookUpdateAction.DRAWING) {
            console.log("DRAWING?")
        } else {
            // Standard case
            if (this.currentlyOpenTLEFItem.item.hasUnsavedChanges) {
                let startTime: moment.Moment = moment(this.currentlyOpenTLEFItem.item.actualStartTime);
                let endTime: moment.Moment = moment(this.currentlyOpenTLEFItem.item.actualEndTime);
                if (this.currentlyOpenTLEFItem.item.changedStartTime) {
                    startTime = moment(this.currentlyOpenTLEFItem.item.changedStartTime);
                }
                if (this.currentlyOpenTLEFItem.item.changedEndTime) {
                    endTime = moment(this.currentlyOpenTLEFItem.item.changedEndTime);
                }
                const foundTimeItem = this.tlefItems.find(item => {
                    return item.actualStartTime.isSame(startTime) &&
                        item.actualEndTime.isSame(endTime);
                });
                if (foundTimeItem) {
                    this._openTLEFItem(foundTimeItem, true);
                } else {
                    const foundIndexItem = this.tlefItems.find(item => item.itemIndex === this.currentlyOpenTLEFItem.item.itemIndex);
                    this._openTLEFItem(foundIndexItem, true);
                }
            } else { }
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
}
