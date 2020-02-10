import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { DaybookControllerService } from '../../../../controller/daybook-controller.service';

@Component({
  selector: 'app-daybook-grid-items-bar',
  templateUrl: './daybook-grid-items-bar.component.html',
  styleUrls: ['./daybook-grid-items-bar.component.css']
})
export class DaybookGridItemsBarComponent implements OnInit {

  constructor(private daybookService: DaybookControllerService) { }

  @Input() startTime: moment.Moment;

  private _gridBarItems: moment.Moment[] = [];

  ngOnInit() {
    if(this.startTime){ 
      this._gridBarItems = this.daybookService.activeDayController.getGridBarItems(this.startTime);
    }else{
      console.log('Error:  no start time input provided into component.')
    }
  }

}
