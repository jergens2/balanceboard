import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryItem } from '../../../timelog-large-frame/timelog-body/timelog-entry/timelog-entry-item.class';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { TimelogEntryFormService } from '../../timelog-entry-form.service';

@Component({
  selector: 'app-tlef-view-only',
  templateUrl: './tlef-view-only.component.html',
  styleUrls: ['./tlef-view-only.component.css']
})
export class TlefViewOnlyComponent implements OnInit {

  public get entryItem(): TimelogEntryItem { return this.tlefService.openedTimelogEntry; }

  constructor(private tlefService: TimelogEntryFormService) { }

  ngOnInit() {
  }

  faPencil = faPencilAlt;

}
