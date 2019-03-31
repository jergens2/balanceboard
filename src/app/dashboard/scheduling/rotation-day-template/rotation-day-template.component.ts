import { Component, OnInit, Input } from '@angular/core';
import { DayTemplate } from '../day-templates/day-template.model';

@Component({
  selector: 'app-rotation-day-template',
  templateUrl: './rotation-day-template.component.html',
  styleUrls: ['./rotation-day-template.component.css']
})
export class RotationDayTemplateComponent implements OnInit {

  @Input() dayTemplate: DayTemplate;

  templateIsSpecified: boolean = false;

  constructor() { }

  ngOnInit() {
    if(this.dayTemplate.name){
      this.templateIsSpecified = true;
    }else{
      this.templateIsSpecified = false;
    }
  }


}
