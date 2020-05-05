import { Component, OnInit } from '@angular/core';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { DaybookControllerService } from '../../controller/daybook-controller.service';
import { DaybookController } from '../../controller/daybook-controller.class';

@Component({
  selector: 'app-weight-log-entry',
  templateUrl: './weight-log-entry.component.html',
  styleUrls: ['./weight-log-entry.component.css']
})
export class WeightLogEntryComponent implements OnInit {

  constructor(private daybookControllerService: DaybookControllerService) { }

  private activeDayController: DaybookController;

  ngOnInit() {
    this.activeDayController = this.daybookControllerService.activeDayController;
    this.updateWeightInfo()
    this.daybookControllerService.activeDayController$.subscribe((activeDayChanged)=>{
      if(activeDayChanged){
        this.activeDayController = activeDayChanged;
        this.updateWeightInfo();
      }

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
