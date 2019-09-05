import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { faCheckCircle as faCheckCircle2, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faCircle, faCheckCircle, faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { TimelogEntryForm } from './timelog-entry-form.class';
import { faBed } from '@fortawesome/free-solid-svg-icons';
import { SleepQuality } from './form-sections/sleep-section/sleep-quality.enum';
import { DaybookService } from '../../../daybook.service';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { ToolsService } from '../../../../../tools-menu/tools/tools.service';
import { ToolComponents } from '../../../../../tools-menu/tools/tool-components.enum';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  constructor(private toolsService: ToolsService, private daybookService: DaybookService) { }

  private activeDay: DaybookDayItem;

  timelogEntryForm: TimelogEntryForm;
  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    this.timelogEntryForm = new TimelogEntryForm(this.daybookService.activeDay);
    this.daybookService.activeDay$.subscribe((activeDay)=>{
      this.activeDay = activeDay;
      this.timelogEntryForm.updateActiveDay(activeDay);
    })
    

  }

  public onClickBanner(banner: string) {
    this.timelogEntryForm.onClickBanner(banner);
  }

  public sleepQualityBeds: SleepQuality[] = [
    SleepQuality.VeryPoor,
    SleepQuality.Poor,
    SleepQuality.Okay,
    SleepQuality.Well,
    SleepQuality.VeryWell,
  ];
  public sleepQuality(sleepQuality: SleepQuality): string[]{
    let index = this.sleepQualityBeds.indexOf(sleepQuality);
    let currentIndex = this.sleepQualityBeds.indexOf(this.timelogEntryForm.sleepQuality);
    if(index <= this.sleepQualityBeds.indexOf(this.timelogEntryForm.sleepQuality)){
      if(currentIndex == 0){
        return ["sleep-quality-very-poor"];
      }else if(currentIndex == 1){
        return ["sleep-quality-poor"];
      }else if(currentIndex == 2){
        return ["sleep-quality-okay"];
      }else if(currentIndex == 3){
        return ["sleep-quality-well"];
      }else if(currentIndex == 4){
        return ["sleep-quality-very-well"];
      }
    }
    return [];
  }


  public onClickCloseTool(){
    this.toolsService.closeTool(ToolComponents.TimelogEntry);
  }

  faEdit = faEdit;
  faBed = faBed;
  faCircle = faCircle;
  faCheck = faCheck;
  faTimes = faTimes;

  ngOnDestroy() {
    this.timelogEntryForm = null;
  }
}
