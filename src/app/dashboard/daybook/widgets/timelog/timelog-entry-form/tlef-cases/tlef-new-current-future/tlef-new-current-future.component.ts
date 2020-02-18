import { Component, OnInit } from '@angular/core';
import { TimelogEntryFormService } from '../../timelog-entry-form.service';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';

@Component({
  selector: 'app-tlef-new-current-future',
  templateUrl: './tlef-new-current-future.component.html',
  styleUrls: ['./tlef-new-current-future.component.css']
})
export class TlefNewCurrentFutureComponent implements OnInit {

  constructor(private tlefService: TimelogEntryFormService) { }

  public get entryItem(): TimelogEntryItem { return this.tlefService.openedTimelogEntry; }

  ngOnInit() {
  }

}
