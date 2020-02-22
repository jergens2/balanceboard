import { Component, OnInit } from '@angular/core';
import { DaybookDisplayService } from '../../../../daybook-display.service';
import * as moment from 'moment';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-new-day-form',
  templateUrl: './new-day-form.component.html',
  styleUrls: ['./new-day-form.component.css']
})
export class NewDayFormComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private toolboxService: ToolboxService) { }

  private _dayOfTheYear: string = "";
  ngOnInit() {

    const lastDayOfYear = moment(this.daybookService.clock).endOf('year').dayOfYear();
    this._dayOfTheYear = this.daybookService.clock.dayOfYear() + "/" + lastDayOfYear;
  }

  public faCog: IconDefinition = faCog;
  public get newDate(): string {
    return this.daybookService.clock.format('MMMM Do YYYY');
  }
  public get dayOfTheYear(): string { return this._dayOfTheYear; }

  public onClickSave() {

    this.toolboxService.closeTool();
  }

}
