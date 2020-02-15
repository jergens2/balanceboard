import { Component, OnInit } from '@angular/core';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { SleepEntryItem } from './sleep-entry-item.class';
import { TimelogEntryFormService } from '../timelog-entry-form.service';

@Component({
  selector: 'app-sleep-entry-form',
  templateUrl: './sleep-entry-form.component.html',
  styleUrls: ['./sleep-entry-form.component.css']
})
export class SleepInputFormComponent implements OnInit {

  constructor(private tlefService: TimelogEntryFormService) { }

  public get sleepItem(): SleepEntryItem { return this.tlefService.openedSleepEntry; }

  ngOnInit() {
    console.log("SLEEP THING", this.tlefService.openedSleepEntry, this.tlefService.openedTimelogEntry, this.tlefService.formCase)
    // this._sleepInputItem = this.toolsService.sleepInputStorage;
    // if(!this._sleepInputItem){
    //   console.log('Error: no sleep input item');
    // }
    // this.toolsService.sleepInputStorage$.subscribe((item)=>{
    //   if(item){
    //     this._sleepInputItem = item;
    //   }
    // })
  }

  public get previousDay(): string { 
    if(this.sleepItem.startTime.format('YYYY-MM-DD') != this.sleepItem.endTime.format('YYYY-MM-DD')){
      return '(' + this.sleepItem.startTime.format('MMM Do') + ')';
    }
    return "";
  }

  public get followingDay(): string { 
    if(this.sleepItem.startTime.format('YYYY-MM-DD') != this.sleepItem.endTime.format('YYYY-MM-DD')){
      return '(' + this.sleepItem.endTime.format('MMM Do') + ')';
    }
    return "";
  }

}
