import { Component, OnInit, Input } from '@angular/core';
import { DayTemplate } from '../day-templates/day-template.model';
import { IDayTemplateItem } from '../day-templates/day-template-item.interface';

@Component({
  selector: 'app-rotation-day-template',
  templateUrl: './rotation-day-template.component.html',
  styleUrls: ['./rotation-day-template.component.css']
})
export class RotationDayTemplateComponent implements OnInit {

  @Input() dayTemplateItem: IDayTemplateItem;

  templateIsSpecified: boolean = false;

  constructor() { }

  ngOnInit() {
    if(this.dayTemplateItem.dayTemplate){
      this.templateIsSpecified = true;
    }else{
      this.templateIsSpecified = false;
    }
  }

  onClickUnspecifiedTemplate(){

  }

}
