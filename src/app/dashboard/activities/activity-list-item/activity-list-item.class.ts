import { ActivityCategoryDefinition } from "../api/activity-category-definition.class";

export class ActivityListItem{

    constructor(activity: ActivityCategoryDefinition){
        this.activity = activity;
    }
    activity: ActivityCategoryDefinition;


    private _isExpanded: boolean = false;
    public onClickExpand(){
        this._isExpanded = true;
    }
    public onClickContract(){
        this._isExpanded = false;
    }
    public get isExpanded(): boolean{ 
        return this._isExpanded;
    }

    private _mouseIsOverHeader: boolean = false;
    public get mouseIsOverHeader(): boolean{
        return this._mouseIsOverHeader;
    }
    onMouseEnterHeader(){
      this._mouseIsOverHeader = true;
    }
  
    onMouseLeaveHeader(){
      this._mouseIsOverHeader = false;
    }

}