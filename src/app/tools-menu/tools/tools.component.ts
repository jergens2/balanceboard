import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { ToolComponents } from './tool-components.enum';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { SizeService } from '../../shared/app-screen-size/size.service';
import { AppScreenSize } from '../../shared/app-screen-size/app-screen-size.enum';
import * as moment from 'moment';
import { TimelogEntryItem } from '../../dashboard/daybook/widgets/timelog/timelog-large/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  faTimes = faTimes;

  constructor(private toolsService: ToolsService, private sizeService: SizeService) { }

  ifNotepad: boolean = false;
  ifActionItem: boolean = false;
  ifTimelogEntry: boolean = false;
  // ifAppointment: boolean = 

  toolName: string = "";

  screenSize: AppScreenSize;


  private _timelogEntryItem: TimelogEntryItem;
  public get timelogEntryItem(): TimelogEntryItem{ return this._timelogEntryItem; }
  
  ngOnInit() {
    // console.log("Tools component init");
    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize)=>{
      this.screenSize = size;
    })
    this.screenSize = this.sizeService.appScreenSize;

    this.toolsService.currentTool$.subscribe((tool: {component: ToolComponents, data: any})=>{
      if(tool.component === ToolComponents.TimelogEntry && tool.data){
        this._timelogEntryItem = tool.data as TimelogEntryItem;
      }
      
      this.toolName = tool.component;

    });  
    // console.log("Tools component init COMPLETE");
  }

  public get currentDate(): string{
    return moment().format('MMMM Do');
  }

  onClickClose(){
    this.toolsService.closeTool();
  }

}
