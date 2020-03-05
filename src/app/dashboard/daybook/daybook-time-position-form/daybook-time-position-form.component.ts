import { Component, OnInit } from '@angular/core';
import { DaybookDisplayService } from '../daybook-display.service';
import * as moment from 'moment';
import { ToolboxService } from '../../../toolbox-menu/toolbox.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TimelogEntryFormService } from '../widgets/timelog/timelog-entry-form/timelog-entry-form.service';
import { DaybookTimePosition } from './daybook-time-position.enum';

@Component({
  selector: 'app-daybook-time-position-form',
  templateUrl: './daybook-time-position-form.component.html',
  styleUrls: ['./daybook-time-position-form.component.css']
})
export class DaybookTimePositionFormComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private toolboxService: ToolboxService, private tlefService: TimelogEntryFormService) { }

  private _dayOfTheYear: string = "";
  private _wakeupTime: moment.Moment;
  private _currentTimePosition: DaybookTimePosition;

  ngOnInit() {

    const lastDayOfYear = moment(this.daybookService.clock).endOf('year').dayOfYear();
    this._dayOfTheYear = this.daybookService.clock.dayOfYear() + "/" + lastDayOfYear;
    this._currentTimePosition = this.daybookService.todayController.timePosition;

    this.daybookService.activeDayController$.subscribe((changed) => {
      const lastDayOfYear = moment(this.daybookService.clock).endOf('year').dayOfYear();
      this._dayOfTheYear = this.daybookService.clock.dayOfYear() + "/" + lastDayOfYear;
      this._currentTimePosition = this.daybookService.todayController.timePosition;
    });
  }

  public faCog: IconDefinition = faCog;
  public faTimes = faTimes;
  public faArrowRight: IconDefinition = faArrowRight;
  public get newDate(): string {
    return this.daybookService.clock.format('MMMM Do YYYY');
  }
  public get dayOfTheYear(): string { return this._dayOfTheYear; }

  public get isNewDay(): boolean {
    return this._currentTimePosition === DaybookTimePosition.NEW_DAY;
  }
  public get isApproachingSleep(): boolean {
    return this._currentTimePosition === DaybookTimePosition.APPROACHING_SLEEP;
  }
  public get isUnclear(): boolean {
    return this._currentTimePosition === DaybookTimePosition.UNCLEAR;
  }

  public onClickContinue() {

    if (this.isNewDay) {
      if (this._wakeupTime) {
        this.daybookService.activeDayController.setWakeupTime(this._wakeupTime);
        this.daybookService.openNewCurrentTimelogEntry();
      } else {
        this.toolboxService.closeTool();
      }
    } else if (this.isApproachingSleep) {

    } else if (this.isUnclear) {

    }


  }

  public onWakeupTimeChanged(time: moment.Moment) {
    this._wakeupTime = moment(time);
  }

  public onClickClose() {
    this.toolboxService.closeTool();
  }

}
