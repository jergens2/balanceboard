import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TimelogService } from '../../../../dashboard/daybook/time-log/timelog.service';
import { TimeSegment } from '../../../../dashboard/daybook/time-log/time-segment-tile/time-segment.model';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { timer, Subscription } from 'rxjs';
import { ModalService } from '../../../../modal/modal.service';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-timelog-entry-form',
  templateUrl: './timelog-entry-form.component.html',
  styleUrls: ['./timelog-entry-form.component.css']
})
export class TimelogEntryFormComponent implements OnInit, OnDestroy {

  // @Input() timelogEntry 

  constructor(private timelogService: TimelogService, private toolsService: ToolsService, private modalService: ModalService) { }

  mostRecentTimelogEntry: TimeSegment;
  timelogEntryForm: FormGroup;

  clockSubscription: Subscription = new Subscription();

  
  private _now = moment();

  ngOnInit() {
    this.mostRecentTimelogEntry = this.timelogService.mostRecentTimelogEntry;
    
    this.timelogEntryForm = new FormGroup({
      
    });

    this.clockSubscription = timer(1000,1000).subscribe(()=>{
      this._now = moment();
    })
  }
  ngOnDestroy(){
    this.clockSubscription.unsubscribe();
  }

  onClickSaveTimelogEntry(){
    
  }

  onClickClose() {
    this.toolsService.closeTool();
    this.modalService.closeModal();
  }

  public get currentTime(): moment.Moment{
    return this._now
  }

  public get howLongAgo(): string{
    let minutes: number = moment().diff(this.mostRecentTimelogEntry.endTime, "minutes");

    function plurality(value: number, name: string): string{
      if(value == 1){
        return "1 "+name+" ago";
      }else{
        return ""+value+" " + name + " ago";
      }
    }

    if(minutes < 60){
      return plurality(minutes, "minutes");
    }else if(minutes >= 60 && minutes < 1440){
      let hours = Math.floor(minutes/60);
      minutes = minutes - (hours*60);

      return plurality(hours, "hours") + ", " + plurality(minutes, "minutes");
    }else if(minutes >= 1440){
      let days = Math.floor(minutes/1440);
      minutes = minutes - (days*1440);
      let remainingString: string = "";
      if(minutes > 60){
        let hours: number = Math.floor(minutes/60)
        minutes = minutes - (hours*60);
        remainingString = plurality(hours, "hours") + "," + plurality(minutes, "minutes");
      }else{
        remainingString = plurality(minutes, "minutes");
      }
      return plurality(days, "days") +", "+remainingString;
    }


    return "";
  }

}
