import { BodyWeight } from '../body-weight.model';
import { HealthProfile } from '../health-profile.model';
import { Router } from '@angular/router';
import { HealthService } from '../health.service';
import { GenericDataEntry } from '../../models/generic-data-entry.model';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';

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

  todayBodyWeightEntered: boolean = false;
  heightIsSet: boolean = false;
  canCalculateBMI: boolean = false;
  calculatedBMI: number;
  weightClassification: string;
  bmiStyle: string = "{}";

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
    
    
    this.healthService.todayHealthProfile.subscribe((healthProfile)=>{
      if(healthProfile){
        this.currentHealthProfile = healthProfile.dataObject as HealthProfile;
        if(this.currentHealthProfile.bodyWeight){
          this.todayBodyWeightEntered = true;
        }
        if(this.currentHealthProfile.heightInMeters){
          this.heightIsSet = true;
        }
        if(this.todayBodyWeightEntered && this.heightIsSet){
          this.canCalculateBMI = true;
          this.calculatedBMI = this.calculateBMI(this.currentHealthProfile.bodyWeight.weightInKg, this.currentHealthProfile.heightInMeters);
          this.weightClassification = this.getWeightClassification(this.calculatedBMI);
        }
      }
      this.loadingHealthProfile = false;
      this.updateHeight = false;
    })
  }

  private calculateBMI(kg, m):number {
    return (kg / (m*m));
  }
  private getWeightClassification(bmi: number): string{
    if(bmi < 18.5){
      this.bmiStyle = "{'color':'orange'}";
      return "underweight";
    }else if(bmi < 25){
      this.bmiStyle = "{'color':'limegreen'}";
      return "normal weight";
    }else if(bmi < 30){
      this.bmiStyle = "{'color':'orange'}";
      return "overweight";
    }else{
      this.bmiStyle = "{'color':'red'}";
      return "obese";
    }
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
    let bodyWeight = new BodyWeight(this.weightInKg, moment().toISOString());
    if(!this.currentHealthProfile){
      //if there is no profile, create a new one.
      this.currentHealthProfile = new HealthProfile(bodyWeight, 0, moment().toISOString());
      this.healthService.saveHealthProfile(this.currentHealthProfile);
    }else{
      this.currentHealthProfile.dateSetISO = moment().toISOString();
      this.currentHealthProfile.bodyWeight = bodyWeight;
      this.healthService.updateCurrentHealthProfile(this.currentHealthProfile);
    }

    
  }

  onClickUpdateWeight(){
    this.weightUnits = 'kg';
    this.bodyWeightForm.setValue({'weight':this.currentHealthProfile.bodyWeight.weightInKg})
    // this.bodyWeightForm.get('weight').setValue(this.currentHealthProfile.bodyWeight.weightInKg);
    this.todayBodyWeightEntered = !this.todayBodyWeightEntered;
  }



}
