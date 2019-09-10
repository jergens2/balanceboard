import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-weightlog-entry-input',
  templateUrl: './weightlog-entry-input.component.html',
  styleUrls: ['./weightlog-entry-input.component.css']
})
export class WeightlogEntryInputComponent implements OnInit {

  constructor() { }


  public weightInputForm: FormGroup;

  private currentWeight: number = 68;

  ngOnInit() {
    this.weightInputForm = new FormGroup({
      "weightInput": new FormControl(this.currentWeight)
    })
  }


  private _unit: string = "kg";
  public get unit(): string {
    return this._unit;
  }



  public onClickUnit() {
    let value: number = this.weightInputForm.controls["weightInput"].value;
    if (this._unit == "kg") {
      // this.weightInputForm.controls["weightInput"].patchValue(Number(this.convertToLbs(value).toFixed(1)));
      this.currentWeight = Number(this.convertToLbs(value).toFixed(0));

      this._unit = "lbs";
    } else if (this._unit == "lbs") {
      // this.weightInputForm.controls["weightInput"].patchValue(Number(this.convertToKg(value).toFixed(1)));
      this.currentWeight = Number(this.convertToKg(value).toFixed(0));
      this._unit = "kg";
    }
    this.weightInputForm.patchValue({ "weightInput": this.currentWeight });
  }

  private convertToLbs(kg: number): number {
    const poundsPerKilogram: number = 2.20462;
    return kg * poundsPerKilogram;
  }
  private convertToKg(lbs: number): number {
    const kilogramsPerPound: number = 0.453592;
    return lbs * kilogramsPerPound;
  }

}
