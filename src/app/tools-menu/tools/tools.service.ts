import { Injectable } from '@angular/core';
import { ToolComponents } from './tool-components.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { TimelogEntryItem } from '../../dashboard/daybook/widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor() { }





  public openTool(component: ToolComponents, data?: any){
    this._currentTool$.next({component: component, data: data});
  }

  public closeTool(component?: ToolComponents){
    if(component == this.currentTool.component){
      this._currentTool$.next(null);
    }else{
      this._currentTool$.next(null);
      console.log("IT was not the same component, or is missing value.")
      console.log("Not fully implemented");
    }
  }


  private _currentTool$: BehaviorSubject<{component: ToolComponents, data: any}> = new BehaviorSubject(null);
  public get currentTool$(): Observable<{component: ToolComponents, data: any}> {
    return this._currentTool$.asObservable();
  }
  public get currentTool(): {component: ToolComponents, data: any}{
    return this._currentTool$.getValue();
  }
}
