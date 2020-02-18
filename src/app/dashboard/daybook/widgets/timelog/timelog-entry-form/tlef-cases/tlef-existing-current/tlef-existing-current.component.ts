import { Component, OnInit } from '@angular/core';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';
import { DaybookDisplayService } from '../../../../../../daybook/daybook-display.service';
import { TimelogEntryFormService } from '../../timelog-entry-form.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import * as moment from 'moment';
import { timer } from 'rxjs';

@Component({
  selector: 'app-tlef-existing-current',
  templateUrl: './tlef-existing-current.component.html',
  styleUrls: ['./tlef-existing-current.component.css']
})
export class TlefExistingCurrentComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService, private tlefService: TimelogEntryFormService) { }

  ngOnInit() {
    this._clock = moment();
    timer(0, 1000).subscribe((tick)=>{
      this._clock = moment();
    });
  }

  private _clock: moment.Moment;
  private _isEditing: boolean = false;
  public get isEditing(): boolean { return this._isEditing; }

  public get entryItem(): TimelogEntryItem { return this.tlefService.openedTimelogEntry; }

  public get clock(): string{
    return this._clock.format('h:mm:ss a');
  }

  public onClickEdit(){
    this._isEditing = true;
  }

}
