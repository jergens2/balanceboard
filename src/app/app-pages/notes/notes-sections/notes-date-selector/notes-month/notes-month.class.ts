import * as moment from 'moment';
import { NotesDate } from '../notes-date.class';

export class NotesMonth {

    private _startOfMonthYYYYMMDD: string;
    private _days: NotesDate[] = [];

    private _monthTitle: string;

    public get startOfMonthYYYYMMDD(): string { return this._startOfMonthYYYYMMDD; }
    public get days(): NotesDate[] { return this._days; }

    public get monthTitle(): string { return this._monthTitle; }

    constructor(startDateYYYYMMDD: string, days: NotesDate[]) {
        this._startOfMonthYYYYMMDD = startDateYYYYMMDD;

        this._monthTitle = moment(startDateYYYYMMDD).format('MMMM YYYY')

        const currentMonth: moment.Moment = moment(startDateYYYYMMDD);
        let currentDateYYYYMMDD: string = moment(startDateYYYYMMDD).day(0).format('YYYY-MM-DD');
        const endDateYYYYMMDD: string = moment(currentDateYYYYMMDD).add(41, 'days').format('YYYY-MM-DD');
        const daysOfMonth: NotesDate[] = [];
        while (currentDateYYYYMMDD < endDateYYYYMMDD) {
            const isSameMonth: boolean = moment(currentDateYYYYMMDD).month() === currentMonth.month();
            if (isSameMonth) {
                const foundDay = days.find(day => day.dateYYYYMMDD === currentDateYYYYMMDD);
                if (foundDay) {
                    daysOfMonth.push(foundDay);
                } else {
                    console.log("error finding day." + currentDateYYYYMMDD)
                }
            } else {
                daysOfMonth.push(new NotesDate(currentDateYYYYMMDD, [], true));
            }
            currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
        }
        this._days = daysOfMonth;
    }


    public setDatesActive(start: NotesDate, end: NotesDate) {
        this.days.filter(day => {
            return !day.isBlankDay && (day.dateYYYYMMDD >= start.dateYYYYMMDD && day.dateYYYYMMDD <= end.dateYYYYMMDD)
        }).forEach(day => day.setAsActive());
    }
    public setDatesInactive() { this.days.forEach(day => day.setAsInactive()); }


    public dragDays(start: NotesDate, end: NotesDate) {
        this.days.filter(day => {
            return !day.isBlankDay && (day.dateYYYYMMDD >= start.dateYYYYMMDD && day.dateYYYYMMDD <= end.dateYYYYMMDD)
        }).forEach(day => day.startDragging());
    }
    public stopDragging() {
        this.days.forEach(day => day.stopDragging());
    }
    public setScales(mostNotesPerDay: number, mostWordsPerDay: number) {
        this.days.forEach(day => day.setScales(mostNotesPerDay, mostWordsPerDay))
    }


}