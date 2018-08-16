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

  constructor(private router: Router, private healthService: HealthService) { }


  loadingHealthProfile: boolean = true;
  updateHeight:boolean = false;

  healthProfiles: GenericDataEntry[];
  currentHealthProfile: HealthProfile;


  now: moment.Moment;


  heightFt: number = 0;
  heightIn: number = 0;

  poundsToKg: number = 0.453592;
  weightUnits: string = "lbs";


  bodyWeightForm: FormGroup;
  

  ngOnInit() {
    this.now = moment();

    this.bodyWeightForm = new FormGroup({
      'weight' : new FormControl(null)
    });
    
    
    this.healthService.currentHealthProfile.subscribe((healthProfile)=>{
      if(healthProfile){
        console.log("there is a health profile", healthProfile);
        this.currentHealthProfile = healthProfile.dataObject as HealthProfile;
      }else{
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
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value * this.poundsToKg);
    }else{
      this.weightUnits = 'lbs';
      this.bodyWeightForm.get('weight').setValue(this.bodyWeightForm.get('weight').value / this.poundsToKg)
      // change input value from kg to lbs equivalent
    }
  }



  

  onClickSubmitWeight(){

  }

  saveHealthProfile(){
    this.healthService.saveHealthProfile(this.currentHealthProfile);
  }


}
