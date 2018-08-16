import { HealthProfile } from './../../../health/health-profile.model';
import * as moment from 'moment';
import { GenericDataEntry } from './../../../models/generic-data-entry.model';
import { HealthService } from './../../../health/health.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-body-weight-widget',
  templateUrl: './body-weight-widget.component.html',
  styleUrls: ['./body-weight-widget.component.css']
})
export class BodyWeightWidgetComponent implements OnInit {

  constructor(private healthService: HealthService) { }
  
  healthProfiles: GenericDataEntry[];
  tableData: Object[];

  ngOnInit() {
    this.healthService.healthProfiles.subscribe((healthProfiles)=>{
      this.healthProfiles = healthProfiles;
      this.tableData = this.healthProfiles.map((healthProfile)=>{
        let profile: HealthProfile = healthProfile.dataObject as HealthProfile;
        return {weightInKg: profile.bodyWeightInKg, heightInM: profile.heightInMeters, date: moment(profile.dateSetISO).format('YYYY-MM-DD')};
      })
    })
  }

  onClickCreateHealthProfile(){
    //navigate to health profile / body weight entry
  }

}
