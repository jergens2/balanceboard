import { Component, OnInit } from '@angular/core';
import { ToolboxService } from './toolbox.service';
import { ToolType } from './tool-type.enum';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ScreenSizeService } from '../shared/app-screen-size/screen-size.service';
import { AppScreenSize } from '../shared/app-screen-size/app-screen-size.enum';
import * as moment from 'moment';
import { TimelogEntryItem } from '../dashboard/daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.css']
})
export class ToolsComponent implements OnInit {

  faTimes = faTimes;

  constructor(private toolsService: ToolboxService, private sizeService: ScreenSizeService) { }

  ifNotepad: boolean = false;
  ifActionItem: boolean = false;
  ifTimelogEntry: boolean = false;
  // ifAppointment: boolean = 

  toolName: string = "";

  screenSize: AppScreenSize;


  private _timelogEntryItem: TimelogEntryItem = null;
  public get timelogEntryItem(): TimelogEntryItem { return this._timelogEntryItem; }

  ngOnInit() {
    // console.log("Tools component init");
    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize) => {
      this.screenSize = size;
    })
    this.screenSize = this.sizeService.appScreenSize;

    this.toolsService.currentTool$.subscribe((tool: ToolType) => {
      if (tool !== null) {
        this.toolName = tool.toString();
      } else {
        this.toolName = "";
        this._timelogEntryItem = null;
      }
    });
    // console.log("Tools component init COMPLETE");
  }

  public get currentDate(): string {
    return moment().format('MMMM Do');
  }

  public get startNewDay(): string { 
    return moment().format('MMMM Do, YYYY')
  }

  onClickClose() {
    this.toolsService.closeTool();
  }

}
