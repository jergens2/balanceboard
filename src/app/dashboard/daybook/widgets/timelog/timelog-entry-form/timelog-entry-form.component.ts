import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { faEdit, faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { TimelogEntryForm } from './timelog-entry-form.class';
import { faBed } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  constructor() { }

  timelogEntryForm: TimelogEntryForm;
  ngOnInit() {
    this.timelogEntryForm = new TimelogEntryForm(moment().format("YYYY-MM-DD"));

  }

  public onClickBanner(banner: string) {
    this.timelogEntryForm.onClickBanner(banner);
  }



  faEdit = faEdit;
  faBed = faBed;
  faCircle = faCircle;
  faCheckCircle = faCheckCircle;

  ngOnDestroy() {
    this.timelogEntryForm = null;
  }
}
