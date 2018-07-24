import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-body-weight',
  templateUrl: './body-weight.component.html',
  styleUrls: ['./body-weight.component.css']
})
export class BodyWeightComponent implements OnInit {

  constructor() { }

  now: moment.Moment;
  poundsToKg: number = 0.453592;
  units: string = "lbs";

  ngOnInit() {
    this.now = moment();
  }



  onClickUnits(){
    if(this.units === 'lbs'){
      this.units = 'kg';
      // change input value from lbs to kg equivalent
    }else{
      this.units = 'lbs';

      // change input value from kg to lbs equivalent
    }
  }


}
