import { NoteHttpService } from "../../dashboard/notes/api/note-http.service";
import { ActivityHttpService } from "../../dashboard/activities/api/activity-http.service";
import { DaybookHttpService } from "../../dashboard/daybook/api/daybook-http.service";
import { TaskHttpService } from "../../dashboard/tasks/task-http.service";
import { UserAccountProfileService } from "../../dashboard/user-account-profile/user-account-profile.service";
import { SleepService } from "../../dashboard/daybook/sleep-manager/sleep.service";

export interface AppServiceList{
    userProfileService: UserAccountProfileService,
    activityService: ActivityHttpService,
    sleepService: SleepService,
    daybookService: DaybookHttpService, 
    noteService: NoteHttpService, 
    taskService: TaskHttpService,    
}