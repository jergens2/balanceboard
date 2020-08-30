import { Component, OnInit } from '@angular/core';
import { DaybookDayItem } from '../../api/daybook-day-item.class';
import { DaybookDayItemController } from '../../api/daybook-day-item-controller';
import { DaybookDisplayService } from '../../daybook-display.service';

@Component({
  selector: 'app-weight-log-entry',
  templateUrl: './weight-log-entry.component.html',
  styleUrls: ['./weight-log-entry.component.css']
})
export class WeightLogEntryComponent implements OnInit {

  constructor(private daybookService: DaybookDisplayService) { }

  private daybookManager: DaybookDayItemController;

  ngOnInit() {
    this.daybookManager = this.daybookService.daybookController;
    // this.updateWeightInfo()
    // this.daybookControllerService.activeDayController$.subscribe((activeDayChanged)=>{
    //   if(activeDayChanged){
    //     this.daybookManager = activeDayChanged;
    //     this.updateWeightInfo();
    //   }

    // });
  }

  private _dailyWeightRecord: number = null;
  public get dailyWeightRecord(): number { return this._dailyWeightRecord; }

  // private updateWeightInfo(){
  //   if(this.daybookManager.dailyWeightLogEntryKg > 0){
  //     this._dailyWeightRecord = this.daybookManager.dailyWeightLogEntryKg;
  //   }else{
  //     this._dailyWeightRecord = null;
  //   }
  // }

}
