import { Component, OnInit, Input } from '@angular/core';
import { DayTemplate } from '../day-template.class';

import * as moment from 'moment';

@Component({
  selector: 'app-day-template-widget',
  templateUrl: './day-template-widget.component.html',
  styleUrls: ['./day-template-widget.component.css']
})
export class DayTemplateWidgetComponent implements OnInit {

  constructor() { }


  @Input() template: DayTemplate;



  hours: any[] = [];

  bodyStyle: any = null;

  ngOnInit() {

    console.log("template is ", this.template)




    


    let gridTemplateRows: string = "";
    let percentages: number[] = [];
    let sumOfMinutes: number = 0;
    let totalMinutes: number = 24*60;
    

    console.log("sumOfMinutes should == totalMinutes: ", sumOfMinutes, totalMinutes);
    let psum: number = 0;
    percentages.forEach(p=>{psum+=p});

    console.log("psum should be 100: ", psum);
    if(psum != 100){
      console.log("bigly error")
      console.log(percentages);
    }
    
    percentages.forEach((percentage:number)=>{
      gridTemplateRows += "" + percentage + "% ";
    })

    this.bodyStyle = { "grid-template-rows": gridTemplateRows };

    

  }





}
