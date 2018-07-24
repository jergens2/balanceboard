import { HealthService } from './../health.service';
import { GenericDataEntry } from './../../models/generic-data-entry.model';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl } from '../../../../node_modules/@angular/forms';

@Component({
  selector: 'app-body-weight',
  templateUrl: './body-weight.component.html',
  styleUrls: ['./body-weight.component.css']
})
export class BodyWeightComponent implements OnInit {

  constructor(private healthService: HealthService) { }


  loadingIdealWeight: boolean = true;

  healthProfiles: GenericDataEntry[];

  now: moment.Moment;
  poundsToKg: number = 0.453592;
  units: string = "lbs";

  bodyWeightForm: FormGroup;

  ngOnInit() {
    this.now = moment();
    this.bodyWeightForm = new FormGroup({
      'weight' : new FormControl(null)
    });
    this.healthService.healthProfiles.subscribe((healthProfiles)=>{
      this.healthProfiles = healthProfiles;
      this.loadingIdealWeight = false;
      console.log(this.healthProfiles);
    })
  }



  onClickUnits(){
    if(this.units === 'lbs'){
      this.units = 'kg';
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value * this.poundsToKg);
    }else{
      this.units = 'lbs';
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value / this.poundsToKg)
      // change input value from kg to lbs equivalent
    }
  }


}
