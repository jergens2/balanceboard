import * as moment from 'moment';
import { TimeSelectionRow } from '../time-selection-row/time-selection-row.class';
import { DaybookDisplayService } from '../../../../../../daybook/daybook-display.service';
import { TimelogDelineatorType, TimelogDelineator } from '../../../timelog-delineator.class';
import { Subscription, Subject, Observable } from 'rxjs';
import { DaybookTimeScheduleStatus } from '../../../../../api/controllers/daybook-time-schedule-status.enum';

export class TimeSelectionColumn {

    private _startTime: moment.Moment;
    private _endTime: moment.Moment;

    private _divisorMinutes: number = 5;

    private _rows: TimeSelectionRow[] = [];


    public get startTime(): moment.Moment { return this._startTime; }
    public get endTime(): moment.Moment { return this._endTime; }
    public get rows(): TimeSelectionRow[] { return this._rows; }


    private _daybookService: DaybookDisplayService;

    constructor(daybookService: DaybookDisplayService) {
        // console.log("Construction TimeSelectionColumn")
        this._daybookService = daybookService;
        this._startTime = moment(this._daybookService.displayStartTime);
        this._endTime = moment(this._daybookService.displayEndTime);
        this._calculateDivisorMinutes();
        this._buildRows();
    }


    private _buildRows() {
        // this._reset();
        const durationMinutes: number = this.endTime.diff(this.startTime, 'minutes');
        const rowCount = durationMinutes / this._divisorMinutes;
        const rows: TimeSelectionRow[] = [];
        const timeScheduleItems = this._daybookService.schedule.timeScheduleItems;
        const availableItems = timeScheduleItems.filter(item => item.status === DaybookTimeScheduleStatus.AVAILABLE);
        let currentTime: moment.Moment = moment(this.startTime);
        for (let i = 0; i < rowCount; i++) {
            // console.log(" " + i + " :" + currentTime.format('hh:mm a') + " to " + moment(currentTime).add(divisorMinutes, 'minutes').format('hh:mm a'))
            let newRow = new TimeSelectionRow(currentTime, moment(currentTime).add(this._divisorMinutes, 'minutes'), i);
            newRow.isAvailable = this._daybookService.schedule.isRangeAvailable(newRow.startTime, newRow.endTime);
            if (newRow.isAvailable) {
                newRow.sectionIndex = availableItems.findIndex(item => newRow.startTime.isSameOrAfter(item.startTime) && newRow.startTime.isBefore(item.endTime));
            }

            let delineator = this._findDelineator(newRow);
            if (delineator) {
                newRow.setDelineator(delineator);
            }
            rows.push(newRow);
            currentTime = moment(currentTime).add(this._divisorMinutes, 'minutes');
        }
        rows.forEach((row) => {
            if (row.isAvailable) {
                if (row.sectionIndex >= 0) {
                    row.earliestAvailability = timeScheduleItems[row.sectionIndex].startTime;
                    row.latestAvailability = timeScheduleItems[row.sectionIndex].endTime;
                } else {
                    console.log("Error of some kind with row availability index")
                }
            }
            // console.log(row.startTime.format('hh:mm a') + " is available? " + row.isAvailable)
        })
        this._rows = rows;
        this._updateRowSubscriptions();
    }


    private _deleteDelineator$: Subject<moment.Moment> = new Subject();
    private _startDragging$: Subject<TimeSelectionRow> = new Subject();
    private _updateDragging$: Subject<TimeSelectionRow> = new Subject();
    private _stopDragging$: Subject<TimeSelectionRow> = new Subject();

    public get deleteDelineator$(): Observable<moment.Moment> { return this._deleteDelineator$.asObservable(); }
    public get startDragging$(): Observable<TimeSelectionRow> { return this._startDragging$.asObservable(); }
    public get updateDragging$(): Observable<TimeSelectionRow> { return this._updateDragging$.asObservable(); }
    public get stopDragging$(): Observable<TimeSelectionRow> { return this._stopDragging$.asObservable(); }

    private _rowSubscriptions: Subscription[] = [];
    private _updateRowSubscriptions() {
        this._rowSubscriptions.forEach(s => s.unsubscribe());
        this._rowSubscriptions = [];
        const deleteSubscriptions = this.rows.map(row => row.deleteDelineator$.subscribe((del: moment.Moment) => {
            this._deleteDelineator$.next(del);
        }));
        const editSubscriptions = this.rows.map(row => row.editDelineator$.subscribe((saveNewDelineator: moment.Moment) => {
            this._daybookService.activeDayController.updateDelineator(row.timelogDelineator.time, saveNewDelineator);
        }));
        const startDragSubs = this.rows.map(row => row.startDragging$.subscribe((startDragging: TimeSelectionRow) => {
            if (startDragging) { this._startDragging$.next(startDragging); }
        }));
        const updateDragSubs = this.rows.map(row => row.updateDragging$.subscribe((updateDragging: TimeSelectionRow) => {
            if (updateDragging) { this._updateDragging$.next(updateDragging); }
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

    private _findDelineator(newRow: TimeSelectionRow): TimelogDelineator {
        const priority = [
            TimelogDelineatorType.FRAME_START,
            TimelogDelineatorType.FRAME_END,
            TimelogDelineatorType.NOW,
            TimelogDelineatorType.WAKEUP_TIME,
            TimelogDelineatorType.FALLASLEEP_TIME,
            TimelogDelineatorType.SAVED_DELINEATOR,
            TimelogDelineatorType.TIMELOG_ENTRY_START,
            TimelogDelineatorType.TIMELOG_ENTRY_END,
            TimelogDelineatorType.DAY_STRUCTURE,
        ];
        const percentThreshold: number = 0.03;
        const totalViewMS = this.endTime.diff(this.startTime, 'milliseconds');
        const rangeMS = totalViewMS * percentThreshold;
        const rangeStart = moment(newRow.startTime).subtract(rangeMS, 'milliseconds');
        const rangeEnd = moment(newRow.startTime).add(rangeMS, 'milliseconds');
        const foundRangeItems = this._daybookService.timelogDelineators.filter(item => {
            return item.time.isSameOrAfter(rangeStart) && item.time.isSameOrBefore(rangeEnd);
        });
        if (foundRangeItems.length > 0) {
            const foundItems = this._daybookService.timelogDelineators.filter(item =>
                item.time.isSameOrAfter(newRow.startTime) && item.time.isBefore(newRow.endTime));
            let foundDelineator: TimelogDelineator;
            if (foundItems.length > 0) {
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
                if (foundRangeItems.length == 1) {
                    return foundDelineator;
                } else if (foundRangeItems.length > 1) {
                    if (priority.indexOf(foundDelineator.delineatorType) <= 8) {
                        // console.log("its less than or equal to 5: " , priority[priority.indexOf(foundDelineator.delineatorType)])
                        return foundDelineator
                    } else {
                        // console.log("its greater than 5: " , priority[priority.indexOf(foundDelineator.delineatorType)])
                        let mostPriority = priority.indexOf(foundRangeItems[0].delineatorType);
                        for (let i = 0; i < foundRangeItems.length; i++) {
                            let thisItemPriority = priority.indexOf(foundRangeItems[i].delineatorType);
                            if (thisItemPriority < mostPriority) {
                                mostPriority = thisItemPriority;
                            }
                        }
                        if (priority.indexOf(foundDelineator.delineatorType) === mostPriority) {
                            return foundDelineator;
                        }
                    }
                }
            }
        }
        return null;
    }

    // private _findSectionIndex(newRow: TimeSelectionRow): number {
    //     const availableItems = this._daybookService.schedule.getAvailableScheduleItems();


    //     if (availableItems.length === 0) {
    //         console.log('Error: no item found')
    //         return -1;
    //     } else if (availableItems.length === 1) {
    //         return 0;
    //     } else if (availableItems.length > 1) {
    //         let foundIndex: number = availableItems.findIndex((scheduleItem) => {
    //             const startsBefore = newRow.startTime.isSameOrBefore(scheduleItem.startTime) && newRow.endTime.isAfter(scheduleItem.startTime);
    //             const endsAfter = newRow.startTime.isBefore(scheduleItem.endTime) && newRow.endTime.isSameOrAfter(scheduleItem.endTime);
    //             const isIn = newRow.startTime.isSameOrAfter(scheduleItem.startTime) && newRow.startTime.isSameOrBefore(scheduleItem.endTime);
    //             return (startsBefore || endsAfter || isIn);
    //         });
    //         if (foundIndex === -1) { console.log('Error: could not find item') }
    //         return foundIndex;
    //     }

    // }

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