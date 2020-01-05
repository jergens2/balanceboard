import { Component, OnInit } from '@angular/core';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { DaybookService } from '../../daybook.service';
import { DaybookController } from '../../controller/daybook-controller.class';

@Component({
  selector: 'app-weight-log-entry',
  templateUrl: './weight-log-entry.component.html',
  styleUrls: ['./weight-log-entry.component.css']
})
export class WeightLogEntryComponent implements OnInit {

  constructor(private daybookService: DaybookService) { }

  private activeDayController: DaybookController;

  ngOnInit() {
    this.activeDayController = this.daybookService.activeDayController;
    this.updateWeightInfo()
    this.daybookService.activeDayController$.subscribe((activeDayChanged)=>{
      this.activeDayController = activeDayChanged;
      this.updateWeightInfo();
    });
  }

  private _dailyWeightRecord: number = null;
  public get dailyWeightRecord(): number { return this._dailyWeightRecord; }

  private updateWeightInfo(){
    if(this.activeDayController.dailyWeightLogEntryKg > 0){
      this._dailyWeightRecord = this.activeDayController.dailyWeightLogEntryKg;
    }else{
      this._dailyWeightRecord = null;
    }
  }

}
