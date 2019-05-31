import { UserDefinedActivity } from "../../dashboard/activities/user-defined-activity.model";


export interface IActivityDropdownListItem{

    activity: UserDefinedActivity;
    isExpanded: boolean;
    generationNumber: number;
    children: IActivityDropdownListItem[];
}