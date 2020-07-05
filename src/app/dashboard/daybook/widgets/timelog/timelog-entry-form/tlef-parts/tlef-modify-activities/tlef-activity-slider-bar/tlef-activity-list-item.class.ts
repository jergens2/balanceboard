import { ActivityCategoryDefinition } from "../../../../../../../activities/api/activity-category-definition.class";
import { ActivitySliderBar } from "./activity-slider-bar.class";
import { Subject, Observable, Subscription } from "rxjs";
import { ITLEFActivitySliderBarItem } from "./activity-slider-bar-item.interface";
import { TimelogEntryActivity } from "../../../../../../api/data-items/timelog-entry-activity.interface";

export class TLEFActivityListItem {


    constructor(activity: ActivityCategoryDefinition, durationMinutes: number, durationPercent: number, totalTimelogEntryMinutes:number, maxPercent: number) {
        this.activity = activity;
        this.color = this.activity.color;
        this._originalColor = this.color;
        this._maxPercent = maxPercent;
        this.durationMinutes = durationMinutes;
        this.durationPercent = durationPercent;
        this.totalTimelogEntryMinutes = totalTimelogEntryMinutes;


        this.sliderBar = new ActivitySliderBar(this.durationPercent, this._maxPercent, this.activity.color);
        this._sliderBarSubscription = this.sliderBar.durationPercent$.subscribe((percentChange: number)=>{
            this.updatePercentage(percentChange, maxPercent, false);
            this._percentChangedBySliderBar.next(percentChange);
        });
    }

    public toEntryActivity(): TimelogEntryActivity{
        return {
            percentage: this.durationPercent,
            activityTreeId: this.activity.treeId,
        }
    }

    
    activity: ActivityCategoryDefinition;
    mouseOver: boolean = false;
    colorPickerIsOpen: boolean = false;
    durationMinutes: number;
    durationPercent: number;
    totalTimelogEntryMinutes: number;

    color: string;

    private _originalColor:string;
    public onClickOpenColorPicker(){
        this.colorPickerIsOpen = true;
    }

    public onClickSaveColorPicker(color: string){
        console.log("Saving color: ", color);
        this._originalColor = color;
        this.color = color;
        this.activity.color = color;
        this.colorPickerIsOpen = false;
        this.sliderBar = new ActivitySliderBar(this.durationPercent, this._maxPercent, this.activity.color);
        this._sliderBarSubscription = this.sliderBar.durationPercent$.subscribe((percentChange: number)=>{
            this.updatePercentage(percentChange, this._maxPercent, false);
            this._percentChangedBySliderBar.next(percentChange);
        });
        this._activityModified$.next(this.activity);
    }
    private _activityModified$: Subject<ActivityCategoryDefinition> = new Subject();
    public get activityModified$(): Observable<ActivityCategoryDefinition> { return this._activityModified$.asObservable(); };
    public onClickCancelColorPicker(){
        // console.log("Color picker cancelled")
        this.color = this._originalColor;
        this.colorPickerIsOpen = false;
    }
    public onColorChanged(color: string){
        // console.log("Color changed (RGBA): ", color);
        this.color = color;
    }

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


    

    private _maxPercent: number;
    private _sliderBarSubscription: Subscription = new Subscription();

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