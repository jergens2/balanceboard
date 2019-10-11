import { TimeOfDay } from "../../../shared/utilities/time-utilities/time-of-day-enum";
import * as moment from 'moment';
import { DayStructureDataItem } from "./data-items/day-structure-data-item.interface";
import { DaybookTimelogEntryDataItem } from "./data-items/daybook-timelog-entry-data-item.interface";
import { DaybookDayItemSleepProfile } from "./data-items/daybook-day-item-sleep-profile.interface";

export interface TimeOfDayQuarter{
    timeOfDay: TimeOfDay;
    startTime: moment.Moment;
    endTime: moment.Moment;
}
    /**
     * This class is an object which contains 3 layers of available time data:
     * 1. Time of day quarters:  Early morning, Morning, Afternoon, Evening,
     * then,
     * 2. Day structure items:  wakeup time, go to work, come home, etc.
     * then,
     * 3. Timelog entries:  walking, eating, working, etc.
     * 
     * The point is to be able to find a reference point back in time earlier in the day with respect to any one of these 3 layers of objects.
     * 
     */
export class DaybookTimeReferencer{
    private dateYYYYMMDD: string = "";
    constructor(dateYYYYMMDD: string, dayStructureItems: DayStructureDataItem[], sleepProfile: DaybookDayItemSleepProfile, timelogEntries: DaybookTimelogEntryDataItem[]){
        this.dateYYYYMMDD = dateYYYYMMDD;
        // this.defaultWakeupTime = moment(this.dateYYYYMMDD).hour(7).minute(30).second(0).millisecond(0);
        // this.defaultFallAsleepTime = moment(this.dateYYYYMMDD).hour(22).minute(30).second(0).millisecond(0);
        this.dayStructureItems = dayStructureItems;
        this.sleepProfile = sleepProfile;
        this.timelogEntries = timelogEntries;
        this.buildDayQuarters();
    }


    static readonly defaultWakeupTime: moment.Moment = moment().hour(7).minute(0).second(0).millisecond(0);
    static readonly defaultBedtime: moment.Moment = moment().hour(22).minute(30).second(0).millisecond(0);
    static readonly defaultpreviousFallAsleepTime: moment.Moment = moment(DaybookTimeReferencer.defaultBedtime).subtract(1, "days");

    private dayQuarters: TimeOfDayQuarter[];
    private dayStructureItems: DayStructureDataItem[];
    private sleepProfile: DaybookDayItemSleepProfile;
    private timelogEntries: DaybookTimelogEntryDataItem[];


    public get lastActionTime(): moment.Moment{
        let lastActionTime: moment.Moment = moment(this.dateYYYYMMDD).startOf("day");
        if(this.sleepProfile.fallAsleepTimeISO){
            lastActionTime = moment(this.sleepProfile.fallAsleepTimeISO);
        }else{
            this.timelogEntries.forEach((timelogEntry)=>{
                if(moment(timelogEntry.endTimeISO).isAfter(lastActionTime)){
                    lastActionTime = moment(timelogEntry.endTimeISO);
                }
            })
        }
        return lastActionTime;
    }

    public get wakeupTime(): moment.Moment{
        if(this.sleepProfile != null){
            if(!(this.sleepProfile.wakeupTimeISO == null || this.sleepProfile.wakeupTimeISO == "") ){
                return moment(this.sleepProfile.wakeupTimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        return moment(this.dateYYYYMMDD).hour(DaybookTimeReferencer.defaultWakeupTime.hour()).minute(DaybookTimeReferencer.defaultWakeupTime.minute()).second(0).millisecond(0);
    }
    public get bedtime(): moment.Moment{
        if(this.sleepProfile != null){
            if(!(this.sleepProfile.bedtimeISO == null || this.sleepProfile.bedtimeISO == "") ){
                return moment(this.sleepProfile.bedtimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        return moment(this.dateYYYYMMDD).hour(DaybookTimeReferencer.defaultBedtime.hour()).minute(DaybookTimeReferencer.defaultBedtime.minute()).second(0).millisecond(0);
    
    }
    public get fallAsleepTime(): moment.Moment{
        if(this.sleepProfile != null){
            if(!(this.sleepProfile.fallAsleepTimeISO == null || this.sleepProfile.fallAsleepTimeISO == "") ){
                return moment(this.sleepProfile.fallAsleepTimeISO);
            }
        }
        // console.log("Returning default wakeupTime value");
        // as of now, the fall asleep time and bed time will be the same value, even though ultimately i would like to distinguish between the 2 variables to get a more accurate sleep profile.
        return moment(this.dateYYYYMMDD).hour(DaybookTimeReferencer.defaultBedtime.hour()).minute(DaybookTimeReferencer.defaultBedtime.minute()).second(0).millisecond(0);
    
    }
    public get mostRecentTimeMarker(): moment.Moment{
        const currentTime: moment.Moment = moment();
        if(currentTime.format("YYYY-MM-DD") == this.dateYYYYMMDD){
            console.log("This method is incomplete.  ")
            // This method currently just grabs the most recent item, in order of: timelogEntry, structureItem, quarterItem
            // but perhaps we don't necessarily want this behavior.  we want the most RELEVANT time, with respect to these items.
            // most relevant does not always mean most recently for each of these.
            // for example, it's 3:00pm, and the most recent timelog entry ended at 10:00am.
            // this method will return 10:00am.  in stead, what do we want?  something more relevant than that.  the 10:00 is old news.
            // or perhaps, we just create a different get method entirely:  get relativeTimeMarker()
            let mostRecentTimelogEntryTime: moment.Moment = this.mostRecentTimelogEntryTime;
            if(mostRecentTimelogEntryTime != null){
                return moment(mostRecentTimelogEntryTime);
            }
            let mostRecentDayStructureItemTime: moment.Moment = this.mostRecentDayStructureItemTime;
            if(mostRecentDayStructureItemTime != null){
                return moment(mostRecentDayStructureItemTime);
            }
            let mostRecentDayQuarterItemTime: moment.Moment = this.mostRecentDayQuarterItemTime;
            if(mostRecentDayQuarterItemTime != null){
                return moment(mostRecentDayQuarterItemTime);
            }else{
                console.log("Error with this method.");
                return null;
            }
        }else{
            console.log("Not the current date.  no action taken");
            return null;
        }
    }

    public get mostRecentTimelogEntryTime(): moment.Moment{
        const currentTime: moment.Moment = moment();
        let mostRecentTime: moment.Moment = null;
        if(currentTime.format("YYYY-MM-DD") == this.dateYYYYMMDD){
            this.timelogEntries.forEach((timelogEntry)=>{
                if(currentTime.isSameOrAfter(moment(timelogEntry.endTimeISO) )){
                    mostRecentTime = moment(timelogEntry.endTimeISO);
                }
            });
            if(mostRecentTime != null){
                console.log("Most recent time is: ", mostRecentTime.format("YYYY-MM-DD hh:mm a"))
                return mostRecentTime;
            }else{
                return null;
            }
        }else{
            console.log("Not the current date.  no action taken");
            return null;
        }
    }
    public get mostRecentDayStructureItemTime(): moment.Moment{
        const currentTime: moment.Moment = moment();
        let mostRecentTime: moment.Moment = null;
        if(currentTime.format("YYYY-MM-DD") == this.dateYYYYMMDD){
            this.dayStructureItems.forEach((dayStructureItem)=>{
                if(currentTime.isSameOrAfter(moment(dayStructureItem.endTimeISO) )){
                    mostRecentTime = moment(dayStructureItem.endTimeISO);
                }
            });
            if(mostRecentTime != null){
                console.log("Most recent time is: ", mostRecentTime.format("YYYY-MM-DD hh:mm a"))
                return mostRecentTime;
            }else{
                return null;
            }
        }else{
            console.log("Not the current date.  no action taken");
            return null;
        }
    }
    public get mostRecentDayQuarterItemTime(): moment.Moment{
        const currentTime: moment.Moment = moment();
        let mostRecentTime: moment.Moment = null;
        if(currentTime.format("YYYY-MM-DD") == this.dateYYYYMMDD){
            this.dayQuarters.forEach((dayQuarter)=>{
                if(currentTime.isSameOrAfter(dayQuarter.endTime)){
                    mostRecentTime = moment(dayQuarter.endTime);
                }
            });
            if(mostRecentTime != null){
                console.log("Most recent time is: ", mostRecentTime.format("YYYY-MM-DD hh:mm a"))
                return mostRecentTime;
            }else{
                return null;
            }
        }else{
            console.log("Not the current date.  no action taken");
            return null;
        }
    }

    private buildDayQuarters(){
        this.dayQuarters = [
            {
                timeOfDay: TimeOfDay.EarlyMorning,
                startTime: moment(this.dateYYYYMMDD).startOf("day"),
                endTime: moment(this.dateYYYYMMDD).startOf("day").add(6, "hours"),
            },
            {
                timeOfDay: TimeOfDay.Morning,
                startTime: moment(this.dateYYYYMMDD).startOf("day").add(6, "hours"),
                endTime: moment(this.dateYYYYMMDD).startOf("day").add(12, "hours"),
            },
            {
                timeOfDay: TimeOfDay.Afternoon,
                startTime: moment(this.dateYYYYMMDD).startOf("day").add(12, "hours"),
                endTime: moment(this.dateYYYYMMDD).startOf("day").add(18, "hours"),
            },
            {
                timeOfDay: TimeOfDay.Evening,
                startTime: moment(this.dateYYYYMMDD).startOf("day").add(18, "hours"),
                endTime: moment(this.dateYYYYMMDD).endOf("day"), // this will be 11:59:59.999, is that desired?
            },
        ]
    }


}