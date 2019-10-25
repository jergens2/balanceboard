import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tle-duration-display',
  templateUrl: './tle-duration-display.component.html',
  styleUrls: ['./tle-duration-display.component.css']
})
export class TleDurationDisplayComponent implements OnInit {

  constructor() { }

  @Input() durationMinutes: number;
  @Input() color: string;

  public units: number[] = [];

  ngOnInit() {
    console.log("Colorm is " , this.color)
    const unitCount: number = Math.ceil(this.durationMinutes/15);
    let units: number[] = [];
    for(let i=0; i< unitCount; i++){
      units.push(i);
    }
    this.units = units;
  }

}
