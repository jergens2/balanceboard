import { Router } from '@angular/router';
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

  constructor(private router: Router, private healthService: HealthService) { }


  loadingIdealWeight: boolean = true;

  healthProfiles: GenericDataEntry[];

  now: moment.Moment;
  poundsToKg: number = 0.453592;
  weightUnits: string = "lbs";
  heightUnits: string = 'Imperial';

  bodyWeightForm: FormGroup;
  heightForm: FormGroup;

  ngOnInit() {
    this.now = moment();
    this.bodyWeightForm = new FormGroup({
      'weight' : new FormControl(null)
    });
    this.heightForm = new FormGroup({
      'heightIn' : new FormControl(null),
      'heightFt' : new FormControl(null),
      'heightCm' : new FormControl(null)
    });
    this.healthService.healthProfiles.subscribe((healthProfiles)=>{
      this.healthProfiles = healthProfiles;
      this.loadingIdealWeight = false;
      console.log(this.healthProfiles);
    })
  }



  onClickWeightUnits(){
    if(this.weightUnits === 'lbs'){
      this.weightUnits = 'kg';
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value * this.poundsToKg);
    }else{
      this.weightUnits = 'lbs';
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value / this.poundsToKg)
      // change input value from kg to lbs equivalent
    }
  }

  onClickHeightUnits(){
    if(this.heightUnits === 'Imperial'){
      this.heightUnits = 'Metric';
    }else{
      this.heightUnits = 'Imperial';
    }
  }

  onClickBuildProfile(){
    this.router.navigateByUrl('/healthProfile');
  }


}
