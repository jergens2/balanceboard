import { HealthProfile } from './../health-profile.model';
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

  /*
    2018-08-16
    Some notes on the current design of this component and the data it saves to the DB:
    
    as of right now every update to weight or height creates a new HealthProfile object wrapped in a GenericDataEntry, and saves to DB.  
    On the one hand I want to be able to save a history of health profiles so that they can be reviewed across a dimension of time (e.g. bodyweight over time)
    On the other hand each of the entries in the DB may make for inefficient use of space and also API calls.  
    
    At some point this should be revisited to improve efficiency

  */


  constructor(private router: Router, private healthService: HealthService) { }


  loadingHealthProfile: boolean = true;
  updateHeight:boolean = false;

  healthProfiles: GenericDataEntry[];
  currentHealthProfile: HealthProfile;

  private weightInKg: number;

  now: moment.Moment;

  
  heightFt: number = 0;
  heightIn: number = 0;

  poundsToKg: number = 0.453592;
  weightUnits: string = "lbs";


  bodyWeightForm: FormGroup;
  

  ngOnInit() {
    this.now = moment();
    this.weightInKg = 0;

    this.bodyWeightForm = new FormGroup({
      'weight' : new FormControl(null)
    });
    
    
    this.healthService.currentHealthProfile.subscribe((healthProfile)=>{
      if(healthProfile){
        this.currentHealthProfile = healthProfile.dataObject as HealthProfile;
      }
      this.loadingHealthProfile = false;
      this.updateHeight = false;
    })
  }

  onClickUpdateHeight(){
    this.updateHeight = !this.updateHeight;
  }

  onClickWeightUnits(){
    if(this.weightUnits === 'lbs'){
      this.weightUnits = 'kg';
      this.weightInKg = this.bodyWeightForm.get('weight').value * this.poundsToKg;
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value * this.poundsToKg);
    }else{
      this.weightUnits = 'lbs';
      this.weightInKg = this.bodyWeightForm.get('weight').value;
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value / this.poundsToKg)
    }
  }

  calculateWeightInKg(){
    if(this.weightUnits === 'lbs'){
      this.weightInKg = this.bodyWeightForm.get('weight').value * this.poundsToKg;
    }else{
      this.weightInKg = this.bodyWeightForm.get('weight').value;
    }
  }

  

  onClickSubmitWeight(){
    this.calculateWeightInKg();
    if(!this.currentHealthProfile){
      this.currentHealthProfile = new HealthProfile(this.weightInKg, 0, moment().toISOString());
    }else{
      this.currentHealthProfile.dateSetISO = moment().toISOString();
      this.currentHealthProfile.bodyWeightInKg = this.weightInKg;
    }

    this.healthService.saveHealthProfile(this.currentHealthProfile);
  }  



}
