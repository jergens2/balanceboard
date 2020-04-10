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

  public faTimes = faTimes;

  constructor(private toolsService: ToolboxService, private sizeService: ScreenSizeService) { }

  // public ifNotepad: boolean = false;
  // public ifActionItem: boolean = false;
  // public ifTimelogEntry: boolean = false;

  public toolName: string = "";
  public screenSize: AppScreenSize;

  ngOnInit() {
    // console.log("Tools component init");
    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize) => {
      this.screenSize = size;
    })
    this.screenSize = this.sizeService.appScreenSize;

    this.toolsService.currentToolQueue$.subscribe((tools: ToolType[]) => {
      console.log("Tool queue subscription: ", tools)
      if (tools.length > 0) {
        this.toolName = tools[0].toString();
      } else {
        this.toolName = "";
      }
    });
    // console.log("Tools component init COMPLETE");
  }

  public get currentDate(): string { return moment().format('MMMM Do'); }
  public get startNewDay(): string { return moment().format('MMMM Do, YYYY'); }

  public get queueCount(): number { return this.toolsService.queueCount; }


  onClickClose() {
    this.toolsService.closeTool();
  }

}
