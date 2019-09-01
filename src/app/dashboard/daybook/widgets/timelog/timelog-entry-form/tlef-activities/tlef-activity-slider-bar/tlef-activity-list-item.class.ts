import { ActivityCategoryDefinition } from "../../../../../../activities/api/activity-category-definition/activity-category-definition.class";
import { ActivitySliderBar } from "./activity-slider-bar.class";
import { Subject, Observable } from "rxjs";
import { ITLEFActivitySliderBarItem } from "./activity-slider-bar-item.interface";

export class TLEFActivityListItem {
    activity: ActivityCategoryDefinition;
    mouseOver: boolean = false;
    durationMinutes: number;
    durationPercent: number;
    totalTimelogEntryMinutes: number;
    private sliderBar: ActivitySliderBar;

    public get sliderBarIsActive():boolean {
        return this.sliderBar.isActive;
    }
    public get sliderBarItems(): ITLEFActivitySliderBarItem[]{ 
        return this.sliderBar.sliderBarItems;
    }

    public deactivate(){
        this.sliderBar.deactivate();
    }
    public activate() {
        this.sliderBar.activate();
    }

    public mouseOverSliderBarItem(sliderBarItem: ITLEFActivitySliderBarItem) {
        this.sliderBar.mouseOverSliderBarItem(sliderBarItem);
    }

    public mouseUpSliderBarItem(sliderBarItem: ITLEFActivitySliderBarItem) {
        this.sliderBar.mouseUpSliderBarItem(sliderBarItem);
    }
    public onClickBarItem(sliderBarItem: ITLEFActivitySliderBarItem){
        this.sliderBar.onClickBarItem(sliderBarItem);
    }

    constructor(activity: ActivityCategoryDefinition, durationMinutes: number, durationPercent: number, totalTimelogEntryMinutes:number, maxPercent: number) {
        this.activity = activity;
        this.durationMinutes = durationMinutes;
        this.durationPercent = durationPercent;
        this.totalTimelogEntryMinutes = totalTimelogEntryMinutes;

        this.sliderBar = new ActivitySliderBar(this.durationPercent, maxPercent, this.activity.color);
        this.sliderBar.durationPercent$.subscribe((percentChange: number)=>{
            this.updatePercentage(percentChange, maxPercent, false);
            this._percentChangedBySliderBar.next(percentChange);
        })
    }

    private _percentChangedBySliderBar: Subject<number> = new Subject();
    public get percentChanged$(): Observable<number> {
        return this._percentChangedBySliderBar.asObservable();
    }  



    updatePercentage(percent: number, maxPercent: number, updateSliderBar: boolean){
        this.durationPercent = percent;
        this.durationMinutes = (this.durationPercent/100) * this.totalTimelogEntryMinutes;

        
        if(updateSliderBar){
            if(this.sliderBar.durationPercent != percent){
                this.sliderBar.update(this.durationPercent, maxPercent);
            }
            
        }
        
    }
}