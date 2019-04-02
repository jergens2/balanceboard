import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';

import { ScheduleService } from './schedule.service';
import { ScheduleRotation } from './schedule-rotation.model';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {

  constructor(private scheduleService: ScheduleService) { }


  rotation: ScheduleRotation = null;

  createRotation: boolean = false;







  ngOnInit() {


    this.scheduleService.rotation$.subscribe((rotation: ScheduleRotation)=>{
      if(rotation){
        this.rotation = rotation;
      }else{
        //rotation is null



      }
    })

    
  }

  

  ngOnDestroy() {
    
  }

  onClickCreateRotation(){
    this.createRotation = true;
  }

  onCloseForm(){
    this.createRotation = false;
  }

}
