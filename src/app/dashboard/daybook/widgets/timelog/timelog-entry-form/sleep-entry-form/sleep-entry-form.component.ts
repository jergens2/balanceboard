import { Component, OnInit } from '@angular/core';
import { ToolboxService } from '../../../../../../toolbox-menu/toolbox.service';
import { SleepEntryItem } from './sleep-entry-item.class';

@Component({
  selector: 'app-sleep-entry-form',
  templateUrl: './sleep-entry-form.component.html',
  styleUrls: ['./sleep-entry-form.component.css']
})
export class SleepInputFormComponent implements OnInit {

  constructor(private toolsService: ToolboxService) { }

  private _sleepInputItem: SleepEntryItem;
  public get sleepItem(): SleepEntryItem { return this._sleepInputItem;}

  ngOnInit() {
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
    if(this._sleepInputItem.startTime.format('YYYY-MM-DD') != this._sleepInputItem.endTime.format('YYYY-MM-DD')){
      return '(' + this._sleepInputItem.startTime.format('MMM Do') + ')';
    }
    return "";
  }

  public get followingDay(): string { 
    if(this._sleepInputItem.startTime.format('YYYY-MM-DD') != this._sleepInputItem.endTime.format('YYYY-MM-DD')){
      return '(' + this._sleepInputItem.endTime.format('MMM Do') + ')';
    }
    return "";
  }

}
