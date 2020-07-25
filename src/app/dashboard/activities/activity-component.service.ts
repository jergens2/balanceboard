import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { ActivityCategoryDefinitionService } from './api/activity-category-definition.service';
import { ModalService } from '../../modal/modal.service';
import { DaybookHttpRequestService } from '../daybook/api/daybook-http-request.service';
import { DaybookActivityUpdater } from './api/daybook-activity-updater.class';
import { DaybookDayItem } from '../daybook/api/daybook-day-item.class';
import { ActivityDataAnalyzer } from './activity-display-item/adi-parts/adi-analysis/activity-data-analyzer.class';

@Injectable({
  providedIn: 'root'
})
export class ActivityComponentService {
  /**   * The purpose of this service is to facilitate the navigating of the activities component.*/
  constructor() { }

  private _activityDefinitionService: ActivityCategoryDefinitionService;
  private _modalService: ModalService;
  private _daybookHttpService: DaybookHttpRequestService;
  private _daybookActivityUpdater: DaybookActivityUpdater;
  private _activityDataAnalyzer: ActivityDataAnalyzer;

  public initiate$(activityDefinitionService: ActivityCategoryDefinitionService,
    modalService: ModalService, daybookHttpService: DaybookHttpRequestService): Observable<boolean> {
    const isLoading$: Subject<boolean> = new Subject();
    this._activityDefinitionService = activityDefinitionService;
    this._modalService = modalService;
    this._daybookHttpService = daybookHttpService;
    this._daybookHttpService.getAllItems$().subscribe((items: DaybookDayItem[]) => {
      this._daybookActivityUpdater = new DaybookActivityUpdater(items);
      this._activityDataAnalyzer = new ActivityDataAnalyzer(items);
      isLoading$.next(true);
    });
    return isLoading$.asObservable();
  }

  private _currentActivity$: BehaviorSubject<ActivityCategoryDefinition> = new BehaviorSubject(null);
  private _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('');

  public get currentActivity(): ActivityCategoryDefinition { return this._currentActivity$.getValue(); }
  public get currentActivity$(): Observable<ActivityCategoryDefinition> { return this._currentActivity$.asObservable(); }

  public get isLoading(): boolean { return this._isLoading$.getValue(); }
  public get isLoading$(): Observable<boolean> { return this._isLoading$.asObservable(); }
  public get loadingMessage(): string { return this._loadingMessage$.getValue(); }
  public get loadingMessage$(): Observable<string> { return this._loadingMessage$.asObservable(); }

  public get updater(): DaybookActivityUpdater { return this._daybookActivityUpdater; }
  public get analyzer(): ActivityDataAnalyzer { return this._activityDataAnalyzer; }
  public get daybookDayItems(): DaybookDayItem[] { return this.updater.daybookDayItems; }

  public openActivity(activity: ActivityCategoryDefinition) {
    this._currentActivity$.next(activity);

    // do some stuff like load daybook history.

    this._isLoading$.next(false);
  }

  public executePermanentlyDeleteActivity() {
    this._modalService.openLoadingModal('Permanently deleting ' + this.currentActivity.name);
    const updatedItems: DaybookDayItem[] = this.updater.executePermanentlyDelete(this.currentActivity);
    if (updatedItems.length > 0) {

      console.log("UPDATED ITEMS: " , updatedItems)

      const updatesComplete$: Subject<boolean> = new Subject();
      updatesComplete$.subscribe(isComplete => {
        this._permanentlyDeleteActivityDefintion();
      });
      console.log("Executing permanent delete: ", updatedItems.length)
      forkJoin(updatedItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
        this._daybookHttpService.updateDaybookDayItem$(item)))
        .subscribe((updatedItems: DaybookDayItem[]) => {
          console.log("Successfully updated " + updatedItems.length + " items");
          updatesComplete$.next(true);
        }, (err) => {
          console.log("error updating day items: ", err);
          updatesComplete$.next(true);
        });
    } else {
      this._permanentlyDeleteActivityDefintion();
    }
  }

  private _permanentlyDeleteActivityDefintion(){
    this._activityDefinitionService.permanentlyDeleteActivity$(this.currentActivity).subscribe((isComplete: boolean) => {
      this._currentActivity$.next(null);
      this._modalService.closeModal();
    });
  }

  public executeMergeWithOther(mergeTo: ActivityCategoryDefinition) {
    this._modalService.openLoadingModal('Merging ' + this.currentActivity.name + " with " + mergeTo.name);
    const fromTreeId: string = this.currentActivity.treeId;
    const toTreeId: string = mergeTo.treeId;
    const updatedItems: DaybookDayItem[] = this.updater.executeMergeActivity(fromTreeId, toTreeId);
    if (updatedItems.length > 0) {
      const updatesComplete$: Subject<boolean> = new Subject();
      updatesComplete$.subscribe(isComplete => {
        this.executePermanentlyDeleteActivity();
      });
      forkJoin(updatedItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
        this._daybookHttpService.updateDaybookDayItem$(item)))
        .subscribe((updatedItems: DaybookDayItem[]) => {
          updatesComplete$.next(true);
        }, (err) => {
          updatesComplete$.next(true);
        });
    } else {
      this.executePermanentlyDeleteActivity();
    }
  }

  

  public executeMoveToTrash() {
    this._modalService.openLoadingModal("Moving " + this.currentActivity.name + " to the trash");
    const activity = this.currentActivity;
    activity.moveToTrash();
    this._activityDefinitionService.updateActivity$(activity).subscribe(isComplete =>{
      this._currentActivity$.next(null);
      this._modalService.closeModal();
    });
  }


}
