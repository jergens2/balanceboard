import { Injectable } from '@angular/core';
import { ToolComponents } from './tool-components.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor() { }




  public openTool(component: ToolComponents){
    this._currentTool$.next(component);
  }

  public closeTool(component?: ToolComponents){
    console.log("closing tool");
    this._currentTool$.next(null);
  }


  private _currentTool$: BehaviorSubject<ToolComponents> = new BehaviorSubject(null);
  public get currentTool$(): Observable<ToolComponents> {
    return this._currentTool$.asObservable();
  }
}
