import { ActivityCategoryDefinition } from "../../app-pages/activities/api/activity-category-definition.class";
import { Subject, Observable } from "rxjs";

export class CreateNewActivityItem{

    constructor(activity: ActivityCategoryDefinition){
        this.activity = activity;
        this.color = activity.color;
        this._originalColor = activity.color;
    }


    public get name(): string { return this.activity.name; };
    public get description(): string { return this.activity.description; };

    colorPickerIsOpen: boolean = false;
    color: string;

    private _originalColor:string;
    public onClickOpenColorPicker(){
        this.colorPickerIsOpen = true;
    }

    public onClickSaveColorPicker(color: string){
        // console.log("Saving color: ", color);
        this._originalColor = color;
        this.color = color;
        this.activity.color = color;
        this.colorPickerIsOpen = false;
        this._activityChanged$.next(this.activity.treeId);
    }
    private _activityChanged$: Subject<string> = new Subject();
    public get activityChanged$(): Observable<string> { return this._activityChanged$.asObservable(); };

    public onClickCancelColorPicker(){
        // console.log("Color picker cancelled")
        this.color = this._originalColor;
        this.colorPickerIsOpen = false;
    }
    public onColorChanged(color: string){
        // console.log("Color changed (RGBA): ", color);
        this.color = color;
    }

    public updateColor(color: string){
        /**
         * When a parent item saves the color, then for each child item in the array, then run this method
         * childItem.updateColor(color)
         */
        this.color = color;
        this._originalColor = color;
        this.activity.color = color;
    }
    public activity: ActivityCategoryDefinition;
}