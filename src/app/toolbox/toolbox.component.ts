import { Component, OnInit } from '@angular/core';
import { ToolboxService } from './toolbox.service';
import { ToolType } from './tool-type.enum';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { AppScreenSizeService } from '../shared/app-screen-size/app-screen-size.service';
import { AppScreenSizeLabel } from '../shared/app-screen-size/app-screen-size-label.enum';
import * as moment from 'moment';
import { TimelogEntryItem } from '../dashboard/daybook/widgets/timelog/timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { AppScreenSize } from '../shared/app-screen-size/app-screen-size.class';

import { trigger, state, style, animate, transition, keyframes, } from '@angular/animations';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.css'],
  animations: [
    trigger('appear', [
      state('appear', style({
        transform: 'translateY(0)',
        opacity: 1,
      })),
      transition('void => *', [
        style({
          transform: 'translateY(-100%)',
          opacity: 0.3,
        }),
        animate(200,),

      ]),
      transition('* => void', [
        animate(200, style({
          transform: 'translateX(-100%)',
          opacity: 0.3,
        }))
      ])
    ]),
  ],
})
export class ToolsComponent implements OnInit {

  public faTimes = faTimes;

  constructor(private toolsService: ToolboxService, private sizeService: AppScreenSizeService) { }

  private _currentTool: ToolType = null;
  public get currentTool(): ToolType { return this._currentTool; }
  public get hasCurrentTool(): boolean { return this.currentTool !== null; }

  public get toolIsNote(): boolean { return this._currentTool === ToolType.NOTEBOOK_ENTRY; }
  public get toolIsActionItem(): boolean { return this._currentTool === ToolType.ACTION_ITEM; }
  public get toolIsTimelogEntry(): boolean { return this._currentTool === ToolType.TIMELOG_ENTRY; }
  public get toolIsActivity(): boolean { return this._currentTool === ToolType.ACTIVITY; }
  public get toolIsFutureEvent(): boolean { return this._currentTool === ToolType.FUTURE_EVENT; }
  public get toolIsSleepEntry(): boolean { return this._currentTool === ToolType.SLEEP_ENTRY; }
  public get toolIsDailyTaskList(): boolean { return this._currentTool === ToolType.DAILY_TASK_LIST; }

  public get toolTitle(): string {
    if (this.toolIsNote) { return 'New note'; }
    else if (this.toolIsActionItem) { return 'New action item'; }
    else if (this.toolIsTimelogEntry) { return 'New timelog entry'; }
    else if (this.toolIsActivity) { return 'New activity definition'; }
    else if (this.toolIsFutureEvent) { return 'New future event'; }
    else if (this.toolIsSleepEntry) { return 'Sleep entry'; }
    else if (this.toolIsDailyTaskList) { return 'Daily task list'; }
    else { return ''; }
  }


  public screenSize: AppScreenSizeLabel;

  ngOnInit() {
    // console.log("Tools component init");
    this.sizeService.appScreenSize$.subscribe((size: AppScreenSize) => {
      this.screenSize = size.label;
    })
    this.screenSize = this.sizeService.appScreenSize.label;

    this.toolsService.currentToolQueue$.subscribe((tools: ToolType[]) => {
      // console.log("Tool queue subscription: ", tools)
      if (tools.length > 0) {
        this._currentTool = tools[0];
      } else {
        this._currentTool = null;
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
