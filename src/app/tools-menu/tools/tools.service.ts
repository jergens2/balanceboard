import { Injectable } from '@angular/core';
import { ToolComponents } from './tool-components.enum';
import { Observable, Subject, BehaviorSubject } from 'rxjs';


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
