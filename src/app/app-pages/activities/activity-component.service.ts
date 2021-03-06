import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { BehaviorSubject, Observable, Subject, forkJoin, Subscription } from 'rxjs';
import { ActivityHttpService } from './api/activity-http.service';
import { ModalService } from '../../modal/modal.service';
import { DaybookHttpService } from '../daybook/daybook-day-item/daybook-http.service';
import { DaybookActivityUpdater } from './api/daybook-activity-updater.class';
import { DaybookDayItem } from '../daybook/daybook-day-item/daybook-day-item.class';
import { ActivityDataAnalyzer } from './activity-display-item/adi-parts/adi-summary/activity-data-analyzer.class';
import { ActivityDataSummarizer } from './activity-display-item/adi-parts/adi-summary/activity-data-summarizer.class';
import { ActivityDefinitionTree } from './api/activity-definition-tree.class';

@Injectable({
  providedIn: 'root'
})
export class ActivityComponentService {
  /**   * The purpose of this service is to facilitate the navigating of the activities component.*/
  constructor() { }

  private _activityDefinitionService: ActivityHttpService;
  private _modalService: ModalService;
  private _daybookHttpService: DaybookHttpService;
  private _daybookActivityUpdater: DaybookActivityUpdater;
  private _activitiesSummarizer: ActivityDataSummarizer;

  private _currentActivity$: BehaviorSubject<ActivityCategoryDefinition> = new BehaviorSubject(null);
  private _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private _loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('');

  private _currentViewMode$: BehaviorSubject<'ACTIVITY' | 'LIST' | 'SUMMARY' | 'QUERY'> = new BehaviorSubject('SUMMARY');

  public get activityTree(): ActivityDefinitionTree { return this._activityDefinitionService.activityTree; }

  public get currentActivity(): ActivityCategoryDefinition { return this._currentActivity$.getValue(); }
  public get currentActivity$(): Observable<ActivityCategoryDefinition> { return this._currentActivity$.asObservable(); }

  public get currentViewMode(): 'ACTIVITY' | 'LIST' | 'SUMMARY' | 'QUERY' { return this._currentViewMode$.getValue(); }
  public get currentViewMode$(): Observable<'ACTIVITY' | 'LIST' | 'SUMMARY' | 'QUERY'> { return this._currentViewMode$.asObservable(); }

  public get viewModeIsActivity(): boolean { return this.currentViewMode === 'ACTIVITY'; }
  public get viewModeIsList(): boolean { return this.currentViewMode === 'LIST'; }
  public get viewModeIsSummary(): boolean { return this.currentViewMode === 'SUMMARY'; }
  public get viewModeIsQuery(): boolean { return this.currentViewMode === 'QUERY'; }

  public get isLoading(): boolean { return this._isLoading$.getValue(); }
  public get isLoading$(): Observable<boolean> { return this._isLoading$.asObservable(); }
  public get loadingMessage(): string { return this._loadingMessage$.getValue(); }
  public get loadingMessage$(): Observable<string> { return this._loadingMessage$.asObservable(); }

  public get updater(): DaybookActivityUpdater { return this._daybookActivityUpdater; }
  public get summarizer(): ActivityDataSummarizer { return this._activitiesSummarizer; }
  public get daybookDayItems(): DaybookDayItem[] { return this.updater.daybookDayItems; }


  private _activitySub: Subscription = new Subscription();

  public initiate$(activityDefinitionService: ActivityHttpService,
    modalService: ModalService, daybookHttpService: DaybookHttpService): Observable<boolean> {
    const isLoading$: Subject<boolean> = new Subject();
    this._activityDefinitionService = activityDefinitionService;
    this._modalService = modalService;
    this._daybookHttpService = daybookHttpService;


    // isLoading$.next(true);
    // isLoading$.complete();
    this._daybookHttpService.getAllItems$().subscribe((items: DaybookDayItem[]) => {
      this._daybookActivityUpdater = new DaybookActivityUpdater(items);
      // this._activityDataAnalyzer = new ActivityDataAnalyzer(items);
      this._activitiesSummarizer = new ActivityDataSummarizer(items, this._activityDefinitionService.activityTree);
      if (this.currentActivity) {
        this._activitiesSummarizer.analyzeActivityAndChildren(this.currentActivity);
      }
      this._activitySub = this._activityDefinitionService.activityTree$.subscribe(changedTree => {
        if (changedTree) {
          if (this.currentActivity) {
            const foundExisting = changedTree.findActivityByTreeId(this.currentActivity.treeId);
            this.openActivity(foundExisting);
          }
        }
      });
      isLoading$.next(true);
    });
    return isLoading$.asObservable();
  }

  public unload() {
    this._activitySub.unsubscribe();
    this._daybookHttpService = null;
    this._activityDefinitionService = null;
    this._currentActivity$.next(null);
  }

  public restart() {
    this._currentActivity$.next(null);
  }

  public openActivity(activity: ActivityCategoryDefinition) {
    // console.log("Opening activity: " + activity.name);
    this._currentActivity$.next(activity);
    this._currentViewMode$.next('ACTIVITY');
    this.summarizer.analyzeActivityAndChildren(activity);
    this._isLoading$.next(false);
  }
  public viewAllActivities() {
    this._currentViewMode$.next('LIST');
  }
  public viewSummary() {
    this._currentViewMode$.next('SUMMARY');
  }
  public viewQuery() {
    this._currentViewMode$.next('QUERY');
  }

  public executePermanentlyDeleteActivity() {
    this._modalService.openLoadingModal('Permanently deleting ' + this.currentActivity.name);
    const updatedItems: DaybookDayItem[] = this.updater.executePermanentlyDelete(this.currentActivity);
    if (updatedItems.length > 0) {

      // console.log("UPDATED ITEMS: " , updatedItems)

      const updatesComplete$: Subject<boolean> = new Subject();
      updatesComplete$.subscribe(isComplete => {
        this._permanentlyDeleteActivityDefintion();
      });
      // console.log("Executing permanent delete: ", updatedItems.length)
      forkJoin(updatedItems.map<Observable<DaybookDayItem>>((item: DaybookDayItem) =>
        this._daybookHttpService.updateDaybookDayItem$(item)))
        .subscribe((updatedItems: DaybookDayItem[]) => {
          // console.log("Successfully updated " + updatedItems.length + " items");
          updatesComplete$.next(true);
        }, (err) => {
          console.log("error updating day items: ", err);
          updatesComplete$.next(true);
        });
    } else {
      this._permanentlyDeleteActivityDefintion();
    }
  }

  private _permanentlyDeleteActivityDefintion() {
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
    this._activityDefinitionService.updateActivity$(activity).subscribe(isComplete => {
      this._currentActivity$.next(null);
      this._modalService.closeModal();
    });
  }


}
