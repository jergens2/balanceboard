import { Injectable } from '@angular/core';
import { TimelogEntryItem } from '../timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToolboxService } from '../../../../../toolbox-menu/toolbox.service';
import { DaybookControllerService } from '../../../controller/daybook-controller.service';

@Injectable({
  providedIn: 'root'
})
export class TimelogEntryFormService {

  constructor(private toolBoxService: ToolboxService, private daybookControllerService: DaybookControllerService) { }


  private _activeFormEntry$: BehaviorSubject<TimelogEntryItem> = new BehaviorSubject(null);

  public setTimelogEntry(timelogEntry: TimelogEntryItem){
    this._activeFormEntry$.next(timelogEntry);   
  }
  public getInitialTimelogEntry(): TimelogEntryItem { 
    const value = this._activeFormEntry$.getValue();
    this._activeFormEntry$.next(null);
    return value; 
  }
  public get activeFormEntry$(): Observable<TimelogEntryItem> { 
    return this._activeFormEntry$.asObservable();
  }

  public openCurrentTimelogEntryForm(){


  }



  public openTimelogEntry(timelogEntry: TimelogEntryItem){
    this.setTimelogEntry(timelogEntry);
    this.toolBoxService.openToolNewTimelogEntry();
  }


}
