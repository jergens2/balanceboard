import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SleepService } from '../../../../sleep-manager/sleep.service';
import { SleepCyclePosition } from '../../../../sleep-manager/sleep-profile/sleep-cycle-position.enum';

@Component({
  selector: 'app-energy-chart',
  templateUrl: './energy-chart.component.html',
  styleUrls: ['./energy-chart.component.css']
})
export class EnergyChartComponent implements OnInit {

  constructor(private sleepService: SleepService) { }

  private _chartItems: {
    time: moment.Moment,
    energyLevel: number,
    isFuture: boolean,
    ngStyle: any,
  }[] = [];
  public get chartItems(): {
    time: moment.Moment,
    energyLevel: number,
    isFuture: boolean,
    ngStyle: any,
  }[] { return this._chartItems; }

  ngOnInit(): void {
    // this._buildChart();
  }


  // private _buildChart(){
  //   const maxItems = 120;
  //   const now = moment()
  //   const startTime = moment(now).subtract(24, 'hours').startOf('hour');
  //   const endTime = moment(now).add(24, 'hours').endOf('hour');

  //   const diffMs = moment(endTime).diff(startTime, 'milliseconds');
  //   const msPerItem = diffMs / 120;

  //   let items: {
  //     time: moment.Moment,
  //     energyLevel: number,
  //     isFuture: boolean,
  //     ngStyle: any,
  //   }[] = [];
  //   let currentTime = moment(startTime)
  //   for(let i=0; i<maxItems; i++){
  //     let time = moment(currentTime);
  //     currentTime = moment(currentTime).add(msPerItem, 'milliseconds');
  //     let energyLevel = this._calculateEnergyLevel(time);


  //     let isFuture: boolean = moment(time).isAfter(now);
  //     items.push({
  //       time: time,
  //       energyLevel: energyLevel,
  //       isFuture: isFuture,
  //       ngStyle: {}
  //     });
  //   }

  //   this._chartItems = items;
  // }


  // private _calculateEnergyLevel(time: moment.Moment): number { 
  //   const currentEnergy = this.sleepService.sleepManager.getEnergyLevel();
  //   const currentPosition = this.sleepService.sleepManager.currentPosition;

  //   let energy: number = 0;


  //   if(currentPosition === SleepCyclePosition.SLEEP){
  //     console.log("Unhandled.")
  //     return 0;
  //   }else{

  //     if(time.isBefore(moment())){
        

  //       if(time.isBefore(this.sleepService.sleepManager.previousWakeupTime)){
          
  //         if(time.isBefore(this.sleepService.sleepManager.previousFallAsleepTime)){
            
  //         }else{

  //         }
  //       }else if(time.isSameOrAfter(this.sleepService.sleepManager.previousWakeupTime)){

  //       }
  
  //     }else if(time.isAfter(moment())){
  //       if(time.isAfter(this.sleepService.sleepManager.nextFallAsleepTime)){
          
  //       }else if(time.isSameOrBefore(this.sleepService.sleepManager.nextFallAsleepTime)){

  //       }
  //     }
  //   }

    
  //   return 0;
  // }

}
