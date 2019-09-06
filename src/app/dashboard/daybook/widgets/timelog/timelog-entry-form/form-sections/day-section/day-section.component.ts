import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryForm } from '../../timelog-entry-form.class';
import { TimeOfDay } from '../../../../../../../shared/utilities/time-of-day-enum';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { faCheck, faSyncAlt, faCircle } from '@fortawesome/free-solid-svg-icons';
import { DaySection } from './day-section.interface';
import { DaybookDayItemScheduledActivity } from '../../../../../api/data-items/daybook-day-item-scheduled-activity.class';

@Component({
  selector: 'app-day-section',
  templateUrl: './day-section.component.html',
  styleUrls: ['./day-section.component.css']
})
export class DaySectionComponent implements OnInit {


  @Input() timelogEntryForm: TimelogEntryForm;
  @Input() daySection: DaySection;

  constructor() { }

  ngOnInit() {
    this.daySection.scheduledActivities.forEach((scheduledActivity: DaybookDayItemScheduledActivity)=>{
      console.log("SCheduled activity", scheduledActivity);
      // scheduledActivity.routineMemberActivities.forEach(())
      console.log("member items", scheduledActivity.routineMemberActivities)
    })
  }


  public get daySectionName(): string {
    if (this.daySection) {
      if (this.daySection.timeOfDay == TimeOfDay.EarlyMorning) {
        return "Early morning";
      } else if (this.daySection.timeOfDay == TimeOfDay.Morning) {
        return "Morning";
      } else if (this.daySection.timeOfDay == TimeOfDay.Afternoon) {
        return "Afternoon";
      } else if (this.daySection.timeOfDay == TimeOfDay.Evening) {
        return "Evening";
      }
    }
    return "";
  }

  faCheck = faCheck;
  faSync = faSyncAlt;
  faCircle = faCircle;
}
