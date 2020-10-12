import { DaybookDayItem } from './daybook-day-item.class';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DaybookTimelogEntryController } from './daybook-timelog-entry-controller.class';
import { TimelogEntryItem } from '../widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookTimeDelineatorController } from './daybook-time-delineator-controller.class';

export class DaybookDayItemController {
    /**
     * Expects an array containing prevDayItem, thisDayItem, nextDayItem)
     */
    constructor(dateYYYYMMDD: string, dayItems: DaybookDayItem[]) {
        console.log('Constructing daybook manager for date: ' + dateYYYYMMDD);
        dayItems.forEach(i => console.log("   " + i.dateYYYYMMDD))
        this._dateYYYYMMDD = dateYYYYMMDD;
        this._thisDayYYYYMMDD = this._dateYYYYMMDD;
        this._construct(dateYYYYMMDD, dayItems);
    }

    private _dateYYYYMMDD: string = '';
    private _prevDay: DaybookDayItem;
    private _thisDay: DaybookDayItem;
    private _nextDay: DaybookDayItem;

    private _thisDayYYYYMMDD: string;

    private _timelogEntryController: DaybookTimelogEntryController;
    private _timeDelineatorController: DaybookTimeDelineatorController;



    public get tleController(): DaybookTimelogEntryController { return this._timelogEntryController; }
    public get timelogEntryItems(): TimelogEntryItem[] { return this.tleController.timelogEntryItems; }
    // private get sleepController(): DaybookSleepController { return this._sleepController; }
    // private get energyController(): DaybookEnergyController { return this._energyController; }
    public get delineatorController(): DaybookTimeDelineatorController { return this._timeDelineatorController; }
    public get savedDelineatorTimes(): moment.Moment[] { return this.delineatorController.savedTimeDelineators; }


    public get dateYYYYMMDD(): string { return this._thisDayYYYYMMDD; }
    public get prevDateYYYYMMDD(): string { return moment(this.dateYYYYMMDD).subtract(1, 'days').format('YYYY-MM-DD'); }
    public get thisDateYYYYMMDD(): string { return this.dateYYYYMMDD; }
    public get nextDateYYYYMMDD(): string { return moment(this.dateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD'); }

    public get isToday(): boolean { return this.dateYYYYMMDD === moment().format('YYYY-MM-DD'); }
    public get isTomorrow(): boolean { return this.dateYYYYMMDD === moment().add(1, 'days').format('YYYY-MM-DD'); }
    public get isYesterday(): boolean { return this.dateYYYYMMDD === moment().subtract(1, 'days').format('YYYY-MM-DD'); }
    public get isAfterToday(): boolean { return this.dateYYYYMMDD > moment().format('YYYY-MM-DD'); }
    public get isBeforeToday(): boolean { return this.dateYYYYMMDD < moment().format('YYYY-MM-DD'); }
    public get controllerStartTime(): moment.Moment { return moment(this.dateYYYYMMDD).startOf('day').subtract(1, 'days'); }
    public get controllerEndTime(): moment.Moment { return moment(this.dateYYYYMMDD).startOf('day').add(2, 'days'); }

    public get previousDay(): DaybookDayItem { return this._prevDay; }
    public get thisDay(): DaybookDayItem { return this._thisDay; }
    public get nextDay(): DaybookDayItem { return this._nextDay; }
    public get dayItems(): DaybookDayItem[] { return [this.previousDay, this.thisDay, this.nextDay]; }

    public get startOfPrevDay(): moment.Moment { return moment(this.previousDay.dateYYYYMMDD).startOf('day'); }
    public get startOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day'); }
    public get endOfPrevDay(): moment.Moment { return this.startOfThisDay; }
    public get endOfThisDay(): moment.Moment { return moment(this.thisDay.dateYYYYMMDD).startOf('day').add(24, 'hours'); }
    public get startOfNextDay(): moment.Moment { return this.endOfThisDay; }
    public get endOfNextDay(): moment.Moment { return moment(this.nextDay.dateYYYYMMDD).startOf('day').add(1, 'days'); };



    private _construct(dateYYYYMMDD: string, dayItems: DaybookDayItem[]) {
        if (this._isValid(dayItems)) {
            this._prevDay = dayItems[0];
            this._thisDay = dayItems[1];
            this._nextDay = dayItems[2];
            const delineators = [
                ...this._prevDay.timeDelineators,
                ...this._thisDay.timeDelineators,
                ...this._nextDay.timeDelineators,
            ];
            const relevantTLEItems = {
                prevItems: this._prevDay.timelogEntryDataItems,
                thisItems: this._thisDay.timelogEntryDataItems,
                nextItems: this._nextDay.timelogEntryDataItems,
            };
            this._timeDelineatorController = new DaybookTimeDelineatorController(dateYYYYMMDD, delineators);
            this._timelogEntryController = new DaybookTimelogEntryController(dateYYYYMMDD, relevantTLEItems);
            this._subscribeToChanges();
        } else {
            console.log('Error constructing DaybookScheduleManager')
        }

    }
    private _isValid(dayItems: DaybookDayItem[]): boolean {
        let isValid: boolean = true;
        if (dayItems.length === 3) {
            const prevItemValid: boolean = dayItems[0].dateYYYYMMDD === this.prevDateYYYYMMDD;
            const thisItemValid: boolean = dayItems[1].dateYYYYMMDD === this.thisDateYYYYMMDD;
            const nextItemValid: boolean = dayItems[2].dateYYYYMMDD === this.nextDateYYYYMMDD;
            isValid = prevItemValid && thisItemValid && nextItemValid;
        } else {
            isValid = false;
        }
        if (!isValid) {
            console.log("Day items: ")
            dayItems.forEach(item => console.log(item.dateYYYYMMDD, item))
        }

        return isValid;
    }

    private _subs: Subscription[] = [];
    private _subscribeToChanges() {
        this._subs = [
            this._timeDelineatorController.saveChanges$.subscribe((delineators: moment.Moment[]) => {
                this.thisDay.timeDelineators = delineators;
            }),
            this._timelogEntryController.timelogUpdated$.subscribe(update => {
                this.thisDay.timelogEntryDataItems = update.items;
            })
        ];

    }
}
