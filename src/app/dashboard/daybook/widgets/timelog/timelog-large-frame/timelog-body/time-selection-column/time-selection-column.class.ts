import * as moment from 'moment';
import { TimeSelectionRow } from '../time-selection-row/time-selection-row.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { TimelogDelineatorType, TimelogDelineator } from '../timelog-delineator.class';
import { Subscription, Subject, Observable, range } from 'rxjs';
import { DaybookTimeScheduleStatus } from '../../../../../api/daybook-time-schedule/daybook-time-schedule-status.enum';
import { DaybookTimeScheduleItem } from '../../../../../api/daybook-time-schedule/daybook-time-schedule-item.class';
import { TimeRangeRelationship } from '../../../../../../../shared/time-utilities/time-range-relationship.enum';
import { TimeScheduleItem } from '../../../../../../../shared/time-utilities/time-schedule-item.class';
import { DaybookTimeScheduleAvailableItem } from '../../../../../api/daybook-time-schedule/daybook-time-schedule-available-item.class';

export class TimeSelectionColumn {


    private _displayDelineators: TimelogDelineator[];
    private _availableItems: DaybookTimeScheduleAvailableItem[];
    private _startTime: moment.Moment;
    private _endTime: moment.Moment;
    private _divisorMinutes: number = 5;
    private _rows: TimeSelectionRow[] = [];

    private _deleteDelineator$: Subject<moment.Moment> = new Subject();
    private _startDragging$: Subject<TimeSelectionRow> = new Subject();
    private _updateDragging$: Subject<TimeSelectionRow> = new Subject();
    private _stopDragging$: Subject<TimeSelectionRow> = new Subject();

    private _rowSubscriptions: Subscription[] = [];

    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get rows(): TimeSelectionRow[] { return this._rows; }

    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }


    constructor(delineators: TimelogDelineator[], availableItems: DaybookTimeScheduleAvailableItem[]) {
        this._availableItems = Object.assign([], availableItems);
        this._displayDelineators = delineators;
        this._startTime = moment(delineators[0].time);
        this._endTime = moment(delineators[delineators.length - 1].time);
        this._calculateDivisorMinutes();
        this._buildRows();
    }


    private _buildRows() {
        // console.log("   Rebuilding rows in TimeSelectionColumn.class")
        const durationMinutes: number = this.endTime.diff(this.startTime, 'minutes');
        const rowCount = durationMinutes / this._divisorMinutes;
        const rows: TimeSelectionRow[] = [];
        let currentTime: moment.Moment = moment(this.startTime);
        const availableItems: DaybookTimeScheduleItem[] = this._getMergedAvailableItems();
        for (let i = 0; i < rowCount; i++) {
            const startTime: moment.Moment = moment(currentTime);
            const endTime: moment.Moment = moment(currentTime).add(this._divisorMinutes, 'minutes');
            const sectionIndex = this._findSectionIndex(startTime, endTime, availableItems);
            const section = availableItems[sectionIndex];
            const newRow = new TimeSelectionRow(startTime, endTime, sectionIndex, section);
            const delineator = this._findDelineator(newRow);
            if (delineator) {
                newRow.markTimelogDelineator(delineator);
            }
            rows.push(newRow);
            currentTime = moment(currentTime).add(this._divisorMinutes, 'minutes');
        }
        this._rows = rows;
        // this._rows.forEach((item) => { console.log("  " + item.toString()) })
        this._updateRowSubscriptions();
    }


    private _updateRowSubscriptions() {
        this._rowSubscriptions.forEach(s => s.unsubscribe());
        this._rowSubscriptions = [];
        const deleteSubscriptions = this.rows.map(row => row.deleteDelineator$.subscribe((del: moment.Moment) => {
            this._deleteDelineator$.next(del);
        }));
        const editSubscriptions = this.rows.map(row => row.editDelineator$.subscribe((saveNewDelineator: moment.Moment) => {
            // this._daybookService.daybookController.delineatorController.updateDelineator(row.markedDelineator.time, saveNewDelineator);
        }));
        const startDragSubs = this.rows.map(row => row.startDragging$.subscribe((startDragging: TimeSelectionRow) => {
            if (startDragging) { this._startDragging$.next(startDragging); }
        }));
        const updateDragSubs = this.rows.map(row => row.updateDragging$.subscribe((updateDragging: TimeSelectionRow) => {
            if (updateDragging) {
                this._updateDragging$.next(updateDragging);
            }
        }));
        const stopDragSbus = this.rows.map(row => row.stopDragging$.subscribe((stopDragging: TimeSelectionRow) => {
            if (stopDragging) { this._stopDragging$.next(stopDragging); }
        }));
        this._rowSubscriptions = [
            ...deleteSubscriptions,
            ...editSubscriptions,
            ...startDragSubs,
            ...stopDragSbus,
            ...updateDragSubs,
        ];
    }

    public reset() {
        this._rows.forEach((row) => {
            row.reset();
        });
    }

    private _findSectionIndex(startTime: moment.Moment, endTime: moment.Moment, availableItems: DaybookTimeScheduleItem[]): number {
        if (availableItems.length === 0) {
            console.log('Error: no item found')
            return -1;
        } else if (availableItems.length === 1) {
            return 0;
        } else if (availableItems.length > 1) {
            const foundIndex = availableItems.findIndex(availableItem => {
                const sameStart = startTime.isSame(availableItem.startTime);
                const isDuring = startTime.isSameOrAfter(availableItem.startTime) && endTime.isSameOrBefore(availableItem.endTime);
                if (sameStart || isDuring) {
                    return true;
                } else {
                    const sameEnd = startTime.isBefore(availableItem.endTime) && endTime.isSame(availableItem.endTime);
                    return sameEnd;
                }
            });
            return foundIndex;
        }
    }



    private _findDelineator(newRow: TimeSelectionRow): TimelogDelineator {
        const priority = [
            TimelogDelineatorType.DISPLAY_START,
            TimelogDelineatorType.DISPLAY_END,
            TimelogDelineatorType.NOW,
            TimelogDelineatorType.WAKEUP_TIME,
            TimelogDelineatorType.FALLASLEEP_TIME,
            TimelogDelineatorType.SAVED_DELINEATOR,
            TimelogDelineatorType.TIMELOG_ENTRY_START,
            TimelogDelineatorType.TIMELOG_ENTRY_END,
            TimelogDelineatorType.DAY_STRUCTURE,
        ];
        // const percentThreshold: number = 0.03;
        // const totalViewMS = this.endTime.diff(this.startTime, 'milliseconds');
        // const rangeMS = totalViewMS * percentThreshold;
        // const rangeStart = moment(newRow.startTime).subtract(rangeMS, 'milliseconds');
        // const rangeEnd = moment(newRow.startTime).add(rangeMS, 'milliseconds');
        const delineators = this._displayDelineators;
        const foundRangeItems = delineators.filter(item => {
            return item.time.isSameOrAfter(newRow.startTime) && item.time.isSameOrBefore(newRow.endTime);
        });
        let foundDelineator: TimelogDelineator;
        if (foundRangeItems.length > 0) {
            const foundItems = delineators.filter(item =>
                item.time.isSameOrAfter(newRow.startTime) && item.time.isBefore(newRow.endTime));
            if (foundItems.length === 1) {
                foundDelineator = foundItems[0];
            } else if (foundItems.length > 1) {

                let foundItem = foundItems[0];
                for (let i = 1; i < foundItems.length; i++) {
                    if (priority.indexOf(foundItems[i].delineatorType) < priority.indexOf(foundItems[i - 1].delineatorType)) {
                        foundItem = foundItems[i];
                    }
                }
                foundDelineator = foundItem;
            }
        }
        return foundDelineator;
    }


    /**
     * If there are 2 Available TimeScheduleItems, 1 that starts immediately after the other,
     * and if the reason for the division was due to either a NOW delineator or a DAY_STRUCTURE delineator,
     * then merge the 2 items.
     */
    private _getMergedAvailableItems(): DaybookTimeScheduleItem[] {
        const existingItems: DaybookTimeScheduleAvailableItem[] = this._availableItems;
        console.log("EXISTING ITEMS: " , existingItems.length, existingItems)
        const mergedItems: DaybookTimeScheduleItem[] = [];
        if (existingItems.length > 1) {
            const mergeDelineators: TimelogDelineator[] = this._displayDelineators.filter(item => {
                return (item.delineatorType === TimelogDelineatorType.NOW
                    || item.delineatorType === TimelogDelineatorType.DAY_STRUCTURE);
            });
            for (let i = 1; i < existingItems.length; i++) {
                const item1 = existingItems[i - 1].clone();
                const item2 = existingItems[i].clone();
                const itemsAreContinuous: boolean = item1.getRelationshipTo(item2) === TimeRangeRelationship.IMMEDIATELY_BEFORE;
                let mergeOver: boolean = false;
                if (itemsAreContinuous) {
                    for (let j = 0; j < mergeDelineators.length; j++) {
                        if (item2.startTime.isSame(mergeDelineators[j].time)) {
                            // console.log("ITS THE SAME, BABY!" + mergeDelineators[j].toString())
                            mergeOver = true;
                        }
                    }
                }
                if (mergeOver) {
                    item1.changeEndTime(item2.endTime);
                    mergedItems.push(item1);
                } else {
                    mergedItems.push(item1);
                    mergedItems.push(item2);
                }
            }
        }
        return mergedItems;
    }

    private _calculateDivisorMinutes() {
        // for performance reasons we don't want too many, but for functionality reasons we don't want too few.
        //  100-200 seems like a pretty good range.
        const nearestTo = 100;
        const durationMinutes: number = this.endTime.diff(this.startTime, 'minutes');
        let nearest = 5;
        let nearestDistance = Math.abs(nearestTo - (durationMinutes / nearest));
        [5, 10, 15, 30, 60].forEach((numberOfMinutes) => {
            const divisions = durationMinutes / numberOfMinutes;
            const distanceTo = Math.abs(nearestTo - divisions);
            if (distanceTo < nearestDistance) {
                nearestDistance = distanceTo;
                nearest = numberOfMinutes;
            }
        });
        this._divisorMinutes = nearest;
    }
}