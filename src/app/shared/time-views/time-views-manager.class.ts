import { DaybookDayItem } from "../../app-pages/daybook/daybook-day-item/daybook-day-item.class";
import { ActivityCategoryDefinition } from "../../app-pages/activities/api/activity-category-definition.class";
import * as moment from 'moment';
import { TimeViewDayItem } from "./time-view-day-item.class";
import { TimeViewMonth } from "./tv-month.class";
import { TimeViewYear } from "./tv-year.class";
import { NotebookEntry } from "../../app-pages/notes/notebook-entry/notebook-entry.class";
import { ButtonMenu } from "../components/button-menu/button-menu.class";
import { ColorConverter } from "../utilities/color-converter.class";
import { ColorType } from "../utilities/color-type.enum";
import { Subject, Observable } from "rxjs";

export class TimeViewsManager {
    constructor() {
        this._timeFrameMenu = new ButtonMenu();
        this._timeFrameMenu.addItem$('Week').subscribe(s => this._reQuery('WEEK'));
        this._timeFrameMenu.addItem$('Month').subscribe(s => this._reQuery('MONTH'));
        this._timeFrameMenu.addItem$('Ninety').subscribe(s => this._reQuery('NINETY'));
        this._timeFrameMenu.addItem$('Year').subscribe(s => this._reQuery('YEAR'));
        this._timeFrameMenu.addItem$('Specify').subscribe(s => this._reQuery('SPECIFY'));
    }

    private _timeFrameMenu: ButtonMenu;
    private _items: TimeViewDayItem[] = [];
    private _timeViewMonths: TimeViewMonth[] = [];
    private _currentAppMode: 'ACTIVITY' | 'NOTEBOOK';
    private _notes: NotebookEntry[] = [];
    private _daybookDayItems: DaybookDayItem[] = [];
    private _activity: ActivityCategoryDefinition;
    private _currentView: 'WEEK' | 'MONTH' | 'NINETY' | 'YEAR' | 'SPECIFY' = 'MONTH';
    private _queryChanged$: Subject<{ startDateYYYYMMDD: string, endDateYYYYMMDD: string,}> = new Subject();

    public get items(): TimeViewDayItem[] { return this._items; }
    public get timeViewMonths(): TimeViewMonth[] { return this._timeViewMonths; }
    public get timeFrameMenu(): ButtonMenu { return this._timeFrameMenu; }
    public get currentView(): 'WEEK' | 'MONTH' | 'NINETY' | 'YEAR' | 'SPECIFY' { return this._currentView; }

    public queryChanged$(): Observable<{ startDateYYYYMMDD: string, endDateYYYYMMDD: string,}> { return this._queryChanged$.asObservable(); }
       


    public updateQueryDates(startDateYYYYMMDD: string, endDateYYYYMMDD: string){
        console.log("QUERY: " , startDateYYYYMMDD, endDateYYYYMMDD)
        this._queryChanged$.next({ startDateYYYYMMDD: startDateYYYYMMDD, endDateYYYYMMDD: endDateYYYYMMDD,})
    }

    public setNotebooksView(notes: NotebookEntry[]) {
        this._currentAppMode = 'NOTEBOOK';
        this._notes = notes;
        this._reQuery('YEAR');
    }

    public buildActivityViews(daybookItems: DaybookDayItem[], activity: ActivityCategoryDefinition) {
        this._currentAppMode = 'ACTIVITY';
        this._activity = activity;
        this._daybookDayItems = daybookItems.sort((d1, d2) => {
            if (d1.dateYYYYMMDD < d2.dateYYYYMMDD) { return -1; }
            else if (d1.dateYYYYMMDD > d2.dateYYYYMMDD) { return 1; }
            else { return 0; }
        });
        this._reQuery('YEAR');
    }

    private _reQuery(changeTo?: 'WEEK' | 'MONTH' | 'NINETY' | 'YEAR' | 'SPECIFY') {
        let query: { startDateYYYYMMDD: string, endDateYYYYMMDD: string };
        if (changeTo) {
            this._currentView = changeTo;
            if (changeTo === 'WEEK') {
                query = {
                    startDateYYYYMMDD: moment().startOf('week').format('YYYY-MM-DD'),
                    endDateYYYYMMDD: moment().format('YYYY-MM-DD'),
                };
            } else if (changeTo === 'MONTH') {
                query = {
                    startDateYYYYMMDD: moment().startOf('week').subtract(35, 'days').format('YYYY-MM-DD'),
                    endDateYYYYMMDD: moment().format('YYYY-MM-DD'),
                };
            } else if (changeTo === 'NINETY') {
                query = {
                    startDateYYYYMMDD: moment().subtract(90, 'days').format('YYYY-MM-DD'),
                    endDateYYYYMMDD: moment().format('YYYY-MM-DD'),
                };
            } else if (changeTo === 'YEAR') {
                query = {
                    startDateYYYYMMDD: moment().startOf('year').format('YYYY-MM-DD'),
                    endDateYYYYMMDD: moment().format('YYYY-MM-DD'),
                };
            } else if (changeTo === 'SPECIFY') {
                console.log("SPECIFY")
                query = {
                    startDateYYYYMMDD: moment().subtract(365, 'days').format('YYYY-MM-DD'),
                    endDateYYYYMMDD: moment().format('YYYY-MM-DD'),
                };
            }
        } else {
            query = this._defaultQuery();

        }
        let items: TimeViewDayItem[] = [];
        if (this._currentAppMode === 'NOTEBOOK') {
            let currentDate = query.startDateYYYYMMDD;
            while (currentDate < query.endDateYYYYMMDD) {
                const dayNotes = this._notes.filter(note => note.journalDateYYYYMMDD === currentDate);
                items = [...items, ...dayNotes.map(note => {
                    return new TimeViewDayItem(currentDate, dayNotes.length, 0, 'NOTEBOOK');
                })];
                currentDate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
            }
            let maxVal: number = 0;
            items.forEach(item => {if(item.count > maxVal){ maxVal = item.count}});
            items.forEach(item => {
                if(item.count > 0){
                    let alpha: number = item.count / maxVal;
                    if(alpha < 0.2){
                        alpha = 0.2;
                    }
                    item.color = ColorConverter.convert('rgb(0, 89, 255)', ColorType.RGBA, alpha );
                }
            });
            this._items = items;
            const startDateYYYYMMDD: string = moment().format('YYYY-MM-DD');
            const yearView = new TimeViewYear(startDateYYYYMMDD, items);
            this._timeViewMonths = yearView.months;
        } else if (this._currentAppMode === 'ACTIVITY') {
            const instances: { startTime: moment.Moment, durationMs: number }[] = [];
            this._daybookDayItems.forEach(dayBookItem => {
                dayBookItem.timelogEntryDataItems.forEach(tledi => {
                    const tleStart = moment(tledi.startTimeISO);
                    const tleEnd = moment(tledi.endTimeISO);
                    const totalDuration = tleEnd.diff(tleStart, 'milliseconds');
                    tledi.timelogEntryActivities.forEach(tlea => {
                        if (tlea.activityTreeId === this._activity.treeId) {
                            instances.push({
                                startTime: tleStart,
                                durationMs: totalDuration * (tlea.percentage / 100)
                            });
                        }
                    })
                });
            });
            items = instances.map(instance => new TimeViewDayItem(moment(instance.startTime).format('YYYY-MM-DD'), instances.length, instance.durationMs, 'ACTIVITY'));
            this._items = items;
            const startDateYYYYMMDD: string = moment().format('YYYY-MM-DD');
            const yearView = new TimeViewYear(startDateYYYYMMDD, items);
            this._timeViewMonths = yearView.months;
        } else {
            console.log("Error with time views app mode");
        }
    }

    private _defaultQuery(): { startDateYYYYMMDD: string, endDateYYYYMMDD: string } {
        this._currentView = 'NINETY'
        const now = moment();
        const defaultRangeDays = 90;
        return {
            startDateYYYYMMDD: moment().subtract(defaultRangeDays, 'days').format('YYYY-MM-DD'),
            endDateYYYYMMDD: moment().format('YYYY-MM-DD'),
        };
    }

}