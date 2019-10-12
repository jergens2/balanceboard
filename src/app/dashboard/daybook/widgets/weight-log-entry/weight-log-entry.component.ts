import { Component, OnInit } from '@angular/core';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { DaybookService } from '../../daybook.service';

@Component({
  selector: 'app-weight-log-entry',
  templateUrl: './weight-log-entry.component.html',
  styleUrls: ['./weight-log-entry.component.css']
})
export class WeightLogEntryComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private activeDay: DaybookDayItem;

  ngOnInit() {
    this.activeDay = this.daybookService.activeDay;
    this.updateWeightInfo()
    this.daybookService.activeDay$.subscribe((activeDayChanged)=>{
      this.activeDay = activeDayChanged;
      this.updateWeightInfo();
    });
  }

  private _dailyWeightRecord: number = null;
  public get dailyWeightRecord(): number { return this._dailyWeightRecord; }

  private updateWeightInfo(){
    if(this.activeDay.dailyWeightLogEntryKg > 0){
      this._dailyWeightRecord = this.activeDay.dailyWeightLogEntryKg;
    }else{
      this._dailyWeightRecord = null;
    }
  }

}
