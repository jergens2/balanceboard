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
  currentHealthProfile: GenericDataEntry;

  now: moment.Moment;

  weightInKg: number;
  heightInM: number;

  poundsToKg: number = 0.453592;
  feetToCm: number = 30.48;
  weightUnits: string = "lbs";
  heightUnits: string = 'Imperial';

  bodyWeightForm: FormGroup;
  heightForm: FormGroup;

  ngOnInit() {
    this.now = moment();

    this.weightInKg = 0;
    this.heightInM = 0;

    this.bodyWeightForm = new FormGroup({
      'weight' : new FormControl(null)
    });
    this.heightForm = new FormGroup({
      'heightIn' : new FormControl(null),
      'heightFt' : new FormControl(null),
      'heightCm' : new FormControl(null)
    });
    // this.healthService.healthProfiles.subscribe((healthProfiles)=>{
    //   this.healthProfiles = healthProfiles;
    //   this.loadingIdealWeight = false;
    // })
    this.healthService.currentHealthProfile.subscribe((healthProfile)=>{
      this.currentHealthProfile = healthProfile;
      this.loadingIdealWeight = false;
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
      this.calulateHeightInImperial();
      this.heightUnits = 'Metric';
    }else{
      this.calculateHeightInMetric();
      this.heightUnits = 'Imperial';
    }
  }

  calculateHeight(){
    if(this.heightUnits === 'Imperial'){
      this.calulateHeightInImperial();
    }else{
      this.calculateHeightInMetric();
    }
  }

  calulateHeightInImperial(){
    const ft: number = this.heightForm.value.heightFt as number;
    const inches: number = this.heightForm.value.heightIn as number;
    const totalFt: number = ft + (inches/12);
    this.heightForm.get('heightCm').setValue((totalFt*this.feetToCm).toFixed(1));
    this.heightInM = (totalFt*this.feetToCm / 100);
    
  }
  calculateHeightInMetric(){
    const totalCm: number = this.heightForm.value.heightCm;
    const totalFt: number = totalCm / this.feetToCm;
    const ft: number = Math.floor(totalFt);
    const inches: number = (totalFt - ft)*12;
    this.heightForm.get('heightFt').setValue(ft);
    this.heightForm.get('heightIn').setValue(inches.toFixed(1));
    this.heightInM = totalCm / 100;
    
  }

  onClickSubmitWeight(){

  }
  onClickSubmitHeight(){
    this.calculateHeight();
    
  }


}
