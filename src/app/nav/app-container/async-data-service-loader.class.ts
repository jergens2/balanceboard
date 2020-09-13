import { NoteHttpService } from '../../dashboard/notes/api/note-http.service';
import { ActivityHttpService } from '../../dashboard/activities/api/activity-http.service';
import { DaybookHttpService } from '../../dashboard/daybook/daybook-day-item/daybook-http.service';
import { TaskHttpService } from '../../dashboard/tasks/task-http.service';
import { Observable, BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { AppAsyncServiceList } from './async-data-service-list.interface';
import { SleepService } from '../../dashboard/daybook/sleep-manager/sleep.service';
import { UserAccountProfileService } from '../../dashboard/user-account-profile/user-account-profile.service';

export class AsyncDataServiceLoader {

    private _userProfileService: UserAccountProfileService;
    private _activityHttpService: ActivityHttpService;
    private _sleepService: SleepService;
    private _daybookHttpService: DaybookHttpService;
    private _noteHttpService: NoteHttpService;
    private _taskHttpService: TaskHttpService;

    private _userId: string;

    private _loadingIsComplete$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public get loadingIsComplete$(): Observable<boolean> { return this._loadingIsComplete$.asObservable(); }
    public get loadingIsComplete(): boolean { return this._loadingIsComplete$.getValue(); }

    constructor(userId: string, serviceList: AppAsyncServiceList) {
        this._userId = userId;
        this._userProfileService = serviceList.userProfileService;
        this._activityHttpService = serviceList.activityService;
        this._sleepService = serviceList.sleepService;
        this._daybookHttpService = serviceList.daybookService;
        this._noteHttpService = serviceList.noteService;
        this._taskHttpService = serviceList.taskService;
        this._loadServices();
    }

    private _loadSub: Subscription = new Subscription();
    private _loadServices() {
        this._loadSub = forkJoin([
            this._userProfileService.login$(this._userId),
            this._activityHttpService.login$(this._userId),
            this._sleepService.login$(this._userId),
            this._daybookHttpService.login$(this._userId),
            this._noteHttpService.login$(this._userId),
            this._taskHttpService.login$(this._userId),
        ]).subscribe({
            next: (a) => { },
            error: (e) => console.log('Error loading: ', e),
            complete: () => { this._loadingIsComplete$.next(true); }
        });
    }

    public finishLoading() { this._loadSub.unsubscribe(); }

    public unloadServices() {
        this._activityHttpService.logout();
        this._daybookHttpService.logout();
        this._noteHttpService.logout();
        this._taskHttpService.logout();
        this._userProfileService.logout();
        this._activityHttpService.logout();
        this._sleepService.logout();
        this._daybookHttpService.logout();
        this._noteHttpService.logout();
        this._taskHttpService.logout();

        this._loadingIsComplete$.next(false);
        this._loadingIsComplete$.complete();
    }
}
