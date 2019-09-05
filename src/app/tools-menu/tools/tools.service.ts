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
    if(component == this.currentTool){
      this._currentTool$.next(null);
    }else{
      console.log("IT was not the same component, or is missing value.")
      console.log("Not fully implemented");
    }
  }


  private _currentTool$: BehaviorSubject<ToolComponents> = new BehaviorSubject(null);
  public get currentTool$(): Observable<ToolComponents> {
    return this._currentTool$.asObservable();
  }
  public get currentTool(): ToolComponents{
    return this._currentTool$.getValue();
  }
}
