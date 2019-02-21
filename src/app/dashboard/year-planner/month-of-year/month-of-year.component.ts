import { Component, OnInit, Input } from '@angular/core';
import { IMonthOfYear } from './month-of-year.interface';
import { IDayOfMonthOfYear } from './day-of-month-of-year.interface';

@Component({
  selector: 'app-month-of-year',
  templateUrl: './month-of-year.component.html',
  styleUrls: ['./month-of-year.component.css']
})
export class MonthOfYearComponent implements OnInit {



  @Input() month: IMonthOfYear;

  days: IDayOfMonthOfYear[] = [];

  constructor() { }

  ngOnInit() {

    


  }



}
