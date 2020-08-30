import { Component, OnInit } from '@angular/core';
import { SleepService } from '../../../../sleep.service';

@Component({
  selector: 'app-sdfa-energy',
  templateUrl: './sdfa-energy.component.html',
  styleUrls: ['./sdfa-energy.component.css']
})
export class SdfaEnergyComponent implements OnInit {

  constructor(private sleepService: SleepService) { }

  private _percent: number = 100;
  public get percent(): number { return this._percent; }
  // public get restString(): string { 
  //   if(this.percent < 20){
  //     return 'Very poorly rested';
  //   }else if(this.percent < 40){
  //     return 'Poorly rested';
  //   }else if(this.percent < 60){
  //     return 'Average quality of rest'
  //   }else if(this.percent < 80){
  //     return 'Well rested';
  //   }else if(this.percent <= 100){
  //     return 'Very well rested';
  //   }
  // }
  public get restString(): string { 
    if(this.percent < 25){
      return 'Very poorly rested';
    }else if(this.percent < 50){
      return 'Poorly rested';
    }else if(this.percent < 75){
      return 'Well rested';
    }else if(this.percent <= 100){
      return 'Very well rested';
    }
  }

  ngOnInit(): void {
    if(this.sleepService.sleepDataForm.energyIsSet){
      this._percent = this.sleepService.sleepDataForm.formInputStartEnergyPercent;
    }else{
      this._percent = 100;
    }
    this.onSliderValueChanged(this.percent);
  }

  onSliderValueChanged(value: number){
    this._percent = value;
    this.sleepService.sleepDataForm.setStartEnergy(value);
  }

}
