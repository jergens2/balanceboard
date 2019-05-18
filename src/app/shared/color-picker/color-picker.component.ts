import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

  constructor() { }


  colorPickerValues: any = [
    '#FF5733', //red
    '#FF3380', //hot pink
    '#FF9633', //orange
    '#33E6FF', //baby sky blue
    '#3383FF', //ocean blue
    '#A2FF33', //light lime
    '#33FF49', //hot lime
    '#33FFAF', //hot turquoise
  ]

  ngOnInit() {
  }

}
