import { UserDefinedActivity } from "../../../../dashboard/activities/user-defined-activity.model";
import { ActivitySliderBar } from "./tlef-activity-slider-bar/activity-slider-bar.class";
import { Subject, Observable } from "rxjs";

export class TLEFActivityListItem {
    activity: UserDefinedActivity;
    mouseOver: boolean = false;
    durationMinutes: number;
    durationPercent: number;
    totalTimelogEntryMinutes: number;
    sliderBar: ActivitySliderBar;



    constructor(activity: UserDefinedActivity, durationMinutes: number, durationPercent: number, totalTimelogEntryMinutes:number, maxPercent: number) {
        this.activity = activity;
        this.durationMinutes = durationMinutes;
        this.durationPercent = durationPercent;
        this.totalTimelogEntryMinutes = totalTimelogEntryMinutes;

        this.sliderBar = new ActivitySliderBar(this.durationPercent, maxPercent, this.activity.color);
        this.sliderBar.durationPercent$.subscribe((percentChange: number)=>{
            this.updatePercentage(percentChange, false, maxPercent);

            this._percentChangedBySliderBar.next(percentChange);
        })
    }

    private _percentChangedBySliderBar: Subject<number> = new Subject();
    public get percentChanged$(): Observable<number> {
        return this._percentChangedBySliderBar.asObservable();
    }  

    updatePercentage(percent: number, updateSliderBar: boolean, maxPercent: number){


        this.durationPercent = percent;
        this.durationMinutes = (this.durationPercent/100) * this.totalTimelogEntryMinutes;
        if(updateSliderBar == true){

            this.sliderBar.update(this.durationPercent, maxPercent);
        }
        
    }
}