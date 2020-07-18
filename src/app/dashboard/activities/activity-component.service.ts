import { Injectable } from '@angular/core';
import { ActivityCategoryDefinition } from './api/activity-category-definition.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivityCategoryDefinitionService } from './api/activity-category-definition.service';
import { ModalService } from '../../modal/modal.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityComponentService {
  /**   * The purpose of this service is to facilitate the navigating of the activities component.*/
  constructor() { }

  private _activityDefinitionService: ActivityCategoryDefinitionService;
  private _modalService: ModalService;

  public initiate(activityDefinitionService: ActivityCategoryDefinitionService, modalService: ModalService){
    this._activityDefinitionService = activityDefinitionService;
    this._modalService = modalService;
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

  public openActivity(activity: ActivityCategoryDefinition) {
    this._currentActivity$.next(activity);

    // do some stuff like load daybook history.

    this._isLoading$.next(false);
  }

  public executeDeleteActivity(){
    // this._isLoading$.next(true);
    // this._loadingMessage$.next('Permanently removing ' + this.currentActivity.name);
    console.log("Not implemented:  deleting activity: " + this.currentActivity.name);
    this._modalService.openLoadingModal('Permanently deleting ' + this.currentActivity.name);
    this._activityDefinitionService.permanentlyDeleteActivity$(this.currentActivity).subscribe((isComplete: boolean)=>{
      this._currentActivity$.next(null);
      this._modalService.closeModal();
    });
  }

  public executeMerge(mergeTo: ActivityCategoryDefinition){
    // this._isLoading$.next(true);
    // this._loadingMessage$.next('Merging ' + this.currentActivity.name + " with " + mergeTo.name);
    console.log("Not implemented:  MERGING ", this.currentActivity.name + " with :  " + mergeTo.name);
    this._modalService.openLoadingModal('Merging ' + this.currentActivity.name + " with " + mergeTo.name);
    
  }

  public executeMoveToTrash(){
    // this._isLoading$.next(true);
    // this._loadingMessage$.next("Moving "+ this.currentActivity.name + " to the trash") 
    console.log("Not implemented:  moving activity to trash.");
    this._modalService.openLoadingModal("Moving "+ this.currentActivity.name + " to the trash");
  }
}
