import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { faCheckCircle as faCheckCircle2, faCheck, faTimes, faCoffee, faCannabis } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faCircle, faCheckCircle, faCheckSquare,  } from '@fortawesome/free-regular-svg-icons';
import { DaybookEntryForm } from './daybook-entry-form.class';
import { faBed } from '@fortawesome/free-solid-svg-icons';
import { SleepQuality } from './daybook-entry-form-section/form-sections/wakeup-section/sleep-quality.enum';
import { DaybookService } from '../daybook.service';
import { DaybookDayItem } from '../api/daybook-day-item.class';
import { ToolsService } from '../../../tools-menu/tools/tools.service';
import { ToolComponents } from '../../../tools-menu/tools/tool-components.enum';
import { TimeOfDay } from '../../../shared/utilities/time-of-day-enum';
import { ActivityCategoryDefinition } from '../../activities/api/activity-category-definition.class';

@Component({
  selector: 'app-daybook-entry-form',
  templateUrl: './daybook-entry-form.component.html',
  styleUrls: ['./daybook-entry-form.component.css']
})
export class DaybookEntryFormComponent implements OnInit, OnDestroy {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService) { }

  private activeDay: DaybookDayItem;

  

  private _daybookEntryForm: DaybookEntryForm;
  public get daybookEntryForm(): DaybookEntryForm{
    return this._daybookEntryForm;
  }



  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    this._daybookEntryForm = new DaybookEntryForm(this.daybookService.activeDay);
    this._daybookEntryForm.formSections.forEach((section)=>{
      console.log("is section: " + section.title + " the current active time? ", section.isCurrentTimeSection);
    })
    this.daybookService.activeDay$.subscribe((activeDay)=>{
      this.activeDay = activeDay;
      if(this.daybookEntryForm){
        this.daybookEntryForm.updateActiveDay(activeDay);
      }      
    });
    
  }

  public get currentWeekDay(): string{
    let currentDayOfWeek: number = moment(this.activeDay.dateYYYYMMDD).day();
    if(currentDayOfWeek == 0){
      return "SUNDAY";
    }else if(currentDayOfWeek == 1){
      return "MONDAY";
    }else if(currentDayOfWeek == 2){
      return "TUESDAY"
    }else if(currentDayOfWeek == 3){
      return "WEDNESDAY";
    }else if(currentDayOfWeek == 4){
      return "THURSDAY"
    }else if(currentDayOfWeek == 5){
      return "FRIDAY";
    }else if(currentDayOfWeek == 6){
      return "SATURDAY";
    }else{
      return "";
    }
  }
  public get activeWeekDay(): string{
    //method disabled
    // what we need to do is if we change the date we need to know which date we are active on.
    return this.currentWeekDay;
  }

  public onClickWeekday(weekday: string){
    console.log("Not implemented: change the date to: " + weekday);
  }



  public onClickCloseTool(){
    this.toolsService.closeTool(ToolComponents.TimelogEntry);
  }

  faEdit = faEdit;
  faCircle = faCircle;
  faCheck = faCheck;
  faTimes = faTimes;
  faCoffee = faCoffee;
  faCannabis = faCannabis;

  ngOnDestroy() {
    this._daybookEntryForm = null;
  }
}
