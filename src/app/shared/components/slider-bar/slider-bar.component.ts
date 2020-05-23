import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SliderBarUnit } from './slider-bar-unit.class';

@Component({
  selector: 'app-slider-bar',
  templateUrl: './slider-bar.component.html',
  styleUrls: ['./slider-bar.component.css']
})
export class SliderBarComponent implements OnInit {

  constructor() { }

  private _barUnits: SliderBarUnit[] = [];
  private _rootNgClass: any = {};
  public get barUnits(): SliderBarUnit[] { return this._barUnits; }

  public get rootNgClass(): any { return this._rootNgClass; }

  @Output() valueChanged: EventEmitter<number> = new EventEmitter();

  ngOnInit(): void {
    let barUnits = [];

    const maxValue = 100;

    for(let i=0; i<=maxValue/2; i++){

      const newUnit = new SliderBarUnit((i*2));
      if(i === (maxValue/2)){
        newUnit.set();
      }
      newUnit.setIsValued(maxValue);
      barUnits.push(newUnit);
    }
    this._barUnits = barUnits;
  }

  public onClickUnit(unit: SliderBarUnit){
    this._setItem(unit);
  }


  private _isDragging: boolean = false;
  public get isDragging(): boolean { return this._isDragging; }

  public onIndicatorDown(){
    this._isDragging = true;
  }
  public onIndicatorUp(){
    this._isDragging = false;
    
  }
  public onMouseLeaveRoot(){
    this._isDragging = false;
  }

  public onMouseEnter(unit: SliderBarUnit){
    if(this._isDragging){
      this._setItem(unit);
      
    }
  }
  public onMouseLeave(unit: SliderBarUnit){
    if(this._isDragging){

    }
  }

  public onEnterLeftBuffer(){
    if(this._isDragging){
      const setItem = this.barUnits[0];
      this._setItem(setItem);
    }
  }
  public onEnterRightBuffer(){
    if(this._isDragging){
      const setItem = this.barUnits[this.barUnits.length-1];
      this._setItem(setItem);
    }
  }

  

  private _setItem(unit: SliderBarUnit){
    this._barUnits.forEach((barUnit)=>{
      barUnit.unset();
      barUnit.setIsValued(unit.value);
    });
    unit.set();
    this.valueChanged.emit(unit.value);
  }
  

}
