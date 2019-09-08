import { Component, OnInit, Input } from '@angular/core';
import { TimelogEntryForm } from '../../timelog-entry-form.class';
import { TimeOfDay } from '../../../../../../../shared/utilities/time-of-day-enum';
import { ActivityCategoryDefinition } from '../../../../../../activities/api/activity-category-definition.class';
import { faCheck, faSyncAlt, faCircle } from '@fortawesome/free-solid-svg-icons';

import { DaybookDayItemScheduledActivity } from '../../../../../api/data-items/daybook-day-item-scheduled-activity.class';
import { TimelogEntryFormSection } from '../../timelog-entry-form-section/timelog-entry-form-section.class';

@Component({
  selector: 'app-time-of-day-section',
  templateUrl: './time-of-day-section.component.html',
  styleUrls: ['./time-of-day-section.component.css']
})
export class DaySectionComponent implements OnInit {


  @Input() timelogEntryForm: TimelogEntryForm;
  @Input() formSection: TimelogEntryFormSection;

  public get scheduledRoutineItems(): DaybookDayItemScheduledActivity[]{
    if(this.formSection){
      return this.formSection.scheduledActivities.filter((item)=>{
        return item.isRoutine;
      });
    }else{
      return [];
    }
  }
  public get scheduledActivities(): DaybookDayItemScheduledActivity[]{
    if(this.formSection){
      return this.formSection.scheduledActivities.filter((item)=>{
        return !item.isRoutine;
      })
    }else{
      return [];
    }
  }

  constructor() { }

  ngOnInit() {
    
  }

  

  faCheck = faCheck;
  faSync = faSyncAlt;
  faCircle = faCircle;
  faSyncAlt = faSyncAlt;
}
