import * as moment from 'moment';
import { HealthProfile } from './../../health-profile.model';
import { HealthService } from './../../health.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-height-form',
  templateUrl: './height-form.component.html',
  styleUrls: ['./height-form.component.css']
})
export class HeightFormComponent implements OnInit {

  constructor(private healthService: HealthService) { }

  heightForm: FormGroup;
  heightUnits: string = 'Imperial';
  feetToCm: number = 30.48;

  heightInMeters: number;

  currentHealthProfile: HealthProfile;


  ngOnInit() {

    this.heightInMeters = 0;

    this.heightForm = new FormGroup({
      'heightIn' : new FormControl(null),
      'heightFt' : new FormControl(null),
      'heightCm' : new FormControl(null)
    });

    this.healthService.todayHealthProfile.subscribe((healthProfile)=>{
      if(healthProfile){
        this.currentHealthProfile = healthProfile.dataObject as HealthProfile;
        this.heightInMeters = this.currentHealthProfile.heightInMeters;
      }

    })

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
    this.heightInMeters = (totalFt*this.feetToCm / 100);
    
  }
  calculateHeightInMetric(){
    const totalCm: number = this.heightForm.value.heightCm;
    const totalFt: number = totalCm / this.feetToCm;
    const ft: number = Math.floor(totalFt);
    const inches: number = (totalFt - ft)*12;
    this.heightForm.get('heightFt').setValue(ft);
    this.heightForm.get('heightIn').setValue(inches.toFixed(1));
    this.heightInMeters = totalCm / 100;
    
  }

  onClickSubmitHeight(){
    this.calculateHeight();
    this.saveHealthProfile();
  }

  saveHealthProfile(){
    if(!this.currentHealthProfile){
      const healthProfile = new HealthProfile(null, this.heightInMeters, moment().toISOString());
      this.healthService.saveHealthProfile(healthProfile);
    }else{
      this.currentHealthProfile.heightInMeters = this.heightInMeters;
      this.currentHealthProfile.dateSetISO = moment().toISOString();
      this.healthService.saveHealthProfile(this.currentHealthProfile);
    }
    
  }


}
