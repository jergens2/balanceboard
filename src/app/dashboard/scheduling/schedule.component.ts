import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DayTemplate } from './day-templates/day-template.model';
import * as moment from 'moment';
import { IDayTemplateItem } from './day-templates/day-template-item.interface';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {

  constructor() { }

  rotationForm: FormGroup = null;
  rotationBodyDisplayStyle: any = null;

  formSubscription: Subscription = new Subscription();
  dayTemplateItems: IDayTemplateItem[] = [];

  ngOnInit() {


    let startsOnDate: moment.Moment = moment().startOf("week");

    this.rotationForm = new FormGroup({
      repititionType: new FormControl("Days"),
      repititionCount: new FormControl(7),
      startsOnDate: new FormControl(startsOnDate.format('YYYY-MM-DD'))
    });
    this.buildRotationBodyDisplay();
    this.formSubscription = this.rotationForm.valueChanges.subscribe(() => {
      this.buildRotationBodyDisplay();
    })
  }

  buildRotationBodyDisplay() {
    let count: number = this.rotationForm.controls['repititionCount'].value;
    let type: string = this.rotationForm.controls['repititionType'].value;

    if (count && count > 0) {
      let countDays: number = 0;

      if (type == "Days") {
        countDays = count;
      } else if (type == "Weeks") {
        countDays = 7 * count;
      }

      /*
        up to 7 on one row.
        above 7 gets split onto multiple rows, in an even fashion.  E.g. 8 days is 2 rows of 4.  9, 10 is 2 rows of 5.  14 is 2 rows of 7, 
        15 is 3 rows of 5, 16, 17, 18, is 3 rows of 6, 19, 20, 21, is 3 rows of 7, etc. 
      */

      let rowCount: number = 1;
      let columnCount: number = countDays;
      if (countDays > 7) {
        rowCount = Math.ceil(countDays / 7);
        columnCount = Math.ceil(countDays/rowCount);
      }

      let height: string = "300px";
      if (rowCount > 1) {
        height = "600px";
      }

      let style = {
        "grid-template-rows": "repeat(" + rowCount.toFixed(0) + ", 1fr)",
        "grid-template-columns": "repeat(" + columnCount.toFixed(0) + ", 1fr)",
        "height": height
      }

      let startDate: moment.Moment = moment(this.rotationForm.controls['startsOnDate'].value);
      let currentDate: moment.Moment = moment(startDate);
      let dayTemplateItems: IDayTemplateItem[] = [];
      for (let i = 0; i < countDays; i++) {
        // dayTemplateItems.push(new DayTemplate(i + 1, currentDate));
        let dayTemplateItem: IDayTemplateItem = {
          dayTemplate: null,
          dayOfRotation: i+1,
          date: moment(currentDate).format('YYYY-MM-DD')
        };
        dayTemplateItems.push(dayTemplateItem);
        currentDate = moment(currentDate).add(1, 'days');
      }

      this.dayTemplateItems = dayTemplateItems;
      this.rotationBodyDisplayStyle = style;
    }

  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }

}
