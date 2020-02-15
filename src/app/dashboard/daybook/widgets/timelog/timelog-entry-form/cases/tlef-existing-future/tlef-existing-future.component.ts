import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { DaybookDisplayService } from '../../../../../daybook-display.service';
import { DurationString } from '../../../../../../../shared/utilities/time-utilities/duration-string.class';

@Component({
  selector: 'app-tlef-existing-future',
  templateUrl: './tlef-existing-future.component.html',
  styleUrls: ['./tlef-existing-future.component.css']
})
export class TlefExistingFutureComponent implements OnInit {

  @Input() entryItem: TimelogEntryItem;

  constructor(private daybookDisplayService: DaybookDisplayService) { }

  ngOnInit() {
  }

  public get timeFromNow(): string{
    return DurationString.calculateDurationString(this.daybookDisplayService.clock, this.entryItem.startTime) + " from now";
  }

}
