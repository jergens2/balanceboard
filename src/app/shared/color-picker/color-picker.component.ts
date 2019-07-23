import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

  constructor() { }


  // colorPickerValues: any = [
  //   '#ff0000', //red1
  //   '#ff5252', //red2
  //   '#ff9696', //red3
  //   '#ffd4d4', //red4

  //   '#ff8800', //orange1
  //   '#ffad4f', //orange2
  //   '#ffcb8f', //orange3
  //   '#ffebd4', //orange4

  //   '#ffff00', //yellow1
  //   '#ffff54', //yellow2
  //   '#ffff96', //yellow3
  //   '#ffffc4', //yellow4

  //   '#00ff00', //lime1
  //   '#5cff5c', //lime2
  //   '#8aff8a', //lime3
  //   '#bdffbd', //lime4

  //   '#00ffea', //cyan1
  //   '#63fff2', //cyan2
  //   '#94fff6', //cyan3
  //   '#c7fffa', //cyan4

  //   '#0077ff', //lightblue1
  //   '#479dff', //lightblue2
  //   '#8ac1ff', //lightblue3
  //   '#badbff', //lightblue4

  //   '#0400ff', //darkblue1
  //   '#4a47ff', //darkblue2
  //   '#8c8aff', //darkblue3
  //   '#c5c4ff', //darkblue4

  //   '#7300ff', //purple1
  //   '#9d4dff', //purple2
  //   '#c391ff', //purple3
  //   '#e5cfff', //purple4

  //   '#ff00f2', //pink1
  //   '#ff5cf7', //pink2
  //   '#ff9efa', //pink3
  //   '#ffd1fd', //pink4

  //   '#ff0059', //hotpink1
  //   '#ff528e', //hotpink2
  //   '#ff91b7', //hotpink3
  //   '#ffc4d9', //hotpink4
  // ]

  colorPickerValues: string[] = [
    '#ff0000', //red1
    '#ff8800', //orange1
    '#ffff00', //yellow1
    '#00ff00', //lime1
    '#00ffea', //cyan1
    '#0077ff', //lightblue1
    '#0400ff', //darkblue1
    '#7300ff', //purple1
    '#ff00f2', //pink1
    '#ff0059', //hotpink1

    '#ff5252', //red2
    '#ffad4f', //orange2
    '#ffff54', //yellow2
    '#5cff5c', //lime2
    '#63fff2', //cyan2
    '#479dff', //lightblue2
    '#4a47ff', //darkblue2
    '#9d4dff', //purple2
    '#ff5cf7', //pink2
    '#ff528e', //hotpink2

    '#ff9696', //red3
    '#ffcb8f', //orange3
    '#ffff96', //yellow3
    '#8aff8a', //lime3
    '#94fff6', //cyan3
    '#8ac1ff', //lightblue3
    '#8c8aff', //darkblue3
    '#c391ff', //purple3
    '#ff9efa', //pink3
    '#ff91b7', //hotpink3

    '#ffd4d4', //red4
    '#ffebd4', //orange4
    '#ffffc4', //yellow4
    '#bdffbd', //lime4 
    '#c7fffa', //cyan4
    '#badbff', //lightblue4
    '#c5c4ff', //darkblue4
    '#e5cfff', //purple4
    '#ffd1fd', //pink4
    '#ffc4d9', //hotpink4
  ]

  @Output() colorSelected: EventEmitter<string> = new EventEmitter();

  ngOnInit() {
  }


  onClickColor(value: string){
    this.colorSelected.emit(value);
  }


}
