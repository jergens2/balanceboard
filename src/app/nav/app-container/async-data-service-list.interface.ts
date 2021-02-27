import { NoteHttpService } from "../../app-pages/notes/api/note-http.service";
import { ActivityHttpService } from "../../app-pages/activities/api/activity-http.service";
import { DaybookHttpService } from "../../app-pages/daybook/daybook-day-item/daybook-http.service";
import { TaskHttpService } from "../../app-pages/tasks/task-http.service";
import { UserAccountProfileService } from "../../app-pages/user-account-profile/user-account-profile.service";
import { SleepService } from "../../app-pages/daybook/sleep-manager/sleep.service";

export interface AppAsyncServiceList{
    userProfileService: UserAccountProfileService,
    activityService: ActivityHttpService,
    sleepService: SleepService,
    daybookService: DaybookHttpService, 
    noteService: NoteHttpService, 
    taskService: TaskHttpService,    
}