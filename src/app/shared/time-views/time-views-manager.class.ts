import { DaybookDayItem } from "../../dashboard/daybook/api/daybook-day-item.class";
import { ActivityCategoryDefinition } from "../../dashboard/activities/api/activity-category-definition.class";
import * as moment from 'moment';
import { TimeViewItem } from "./time-view-item.class";
import { TimeViewMonth } from "./tv-month.class";
import { TimeViewYear } from "./tv-year.class";

export class TimeViewsManager{
    constructor(){
        
    }

    private _items: TimeViewItem[] = [];
    private _timeViewMonths: TimeViewMonth[] = [];
    public get items(): TimeViewItem[] { return this._items; }

    public get timeViewMonths(): TimeViewMonth[] { return this._timeViewMonths;  }

    public buildActivityViews(daybookItems: DaybookDayItem[], activity: ActivityCategoryDefinition){
        const instances: { startTime: moment.Moment, durationMs: number }[] = [];
        daybookItems.forEach(dayBookItem =>{
            dayBookItem.timelogEntryDataItems.forEach(tledi =>{ 
                const tleStart = moment(tledi.startTimeISO);
                const tleEnd = moment(tledi.endTimeISO);
                const totalDuration = tleEnd.diff(tleStart, 'milliseconds');
                tledi.timelogEntryActivities.forEach(tlea =>{
                    if(tlea.activityTreeId === activity.treeId){
                        instances.push({
                            startTime: tleStart,
                            durationMs: totalDuration * (tlea.percentage/100)
                        });
                    }
                })
            });
        });
        const items: TimeViewItem[] = instances.map(instance => new TimeViewItem(moment(instance.startTime).format('YYYY-MM-DD'), '', '', instance.durationMs));
        this._items = items;

        const startDateYYYYMMDD: string = moment().format('YYYY-MM-DD');
        const yearView = new TimeViewYear(startDateYYYYMMDD, items);
        this._timeViewMonths = yearView.months;
    }

}