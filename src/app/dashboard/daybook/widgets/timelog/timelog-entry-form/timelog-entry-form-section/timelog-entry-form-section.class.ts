import { TimelogEntryFormSectionType } from "./timelog-entry-form-section-type.enum";

export class TimelogEntryFormSection{
    constructor(type: TimelogEntryFormSectionType){
        this.type = type;
    }

    isExpanded: boolean = true;
    type: TimelogEntryFormSectionType;

    onClickMinimize(){
        this.isExpanded = false;
    }
    onClickExpand(){
        this.isExpanded = true;
    }
}