import { Injectable } from '@angular/core';
import { ToolComponents } from './tool-components.enum';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor() { }

  public openTool(component: ToolComponents){
    console.log("opening component", component);
  }
}
