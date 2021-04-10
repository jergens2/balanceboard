import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { NotesDate } from '../notes-date.class';

@Component({
  selector: 'app-nds-years-view',
  templateUrl: './nds-years-view.component.html',
  styleUrls: ['./nds-years-view.component.css']
})
export class NdsYearsViewComponent implements OnInit {

  constructor() { }

  @Input() public days: NotesDate[];

  @Input() public set startDateYYYYMMDD(dateYYYYMMDD: string) {

    this._rebuild(dateYYYYMMDD);
  }



  private _years: {
    day: NotesDate,
    ngStyle: any,
  }[][] = [];
  public get years(): {
    day: NotesDate,
    ngStyle: any,
  }[][] { return this._years; }

  private _rebuild(startDateYYYYMMDD: string) {

    let currentYear: number = moment(startDateYYYYMMDD).year();
    const endYear = currentYear + 2;
    const years: {
      day: NotesDate,
      ngStyle: any,
    }[][] = [];
    while (currentYear <= endYear) {
      const year: {
        day: NotesDate,
        ngStyle: any,
      }[] = [];
      let currentDateYYYYMMDD: string = moment().startOf('year').year(currentYear).format('YYYY-MM-DD');
      const currentDay: number = moment(currentDateYYYYMMDD).day();
      if (currentDay !== 0) {
        for (let i = 0; i < currentDay; i++) {
          const daysDiff = currentDay - i;
          const fillerDateYYYYMMDD: string = moment(currentDateYYYYMMDD).subtract(daysDiff, 'days').format('YYYY-MM-DD');
          year.push({
            day: new NotesDate(fillerDateYYYYMMDD, [], true),
            ngStyle: {},
          });
        }
      }
      const endOfYearYYYYMMDD: string = moment(currentDateYYYYMMDD).endOf('year').format('YYYY-MM-DD');
      while (currentDateYYYYMMDD <= endOfYearYYYYMMDD) {
        const foundItem = this.days.find(item => item.dateYYYYMMDD === currentDateYYYYMMDD);
        year.push({
          day: foundItem,
          ngStyle: {},
        });
        currentDateYYYYMMDD = moment(currentDateYYYYMMDD).add(1, 'days').format('YYYY-MM-DD');
      }
      currentYear++;
      years.push(year);
    }
    years.forEach(year =>{
      let currentRow = 1;
      let currentCol = 1;
      for(let i=0; i<year.length; i++){
        year[i].ngStyle = {
          'grid-row': ''+currentRow+' / span 1',
          'grid-column': ''+currentCol + ' / span 1'
        };
        currentRow++;
        if(currentRow === 8){
          currentRow = 1;
          currentCol++;
        }
      }
    });
    this._years = years;
  }

  ngOnInit(): void { }


  public yearTitle(year:{    day: NotesDate,    ngStyle: any,  }[]): string{
    if(year.length > 30){
      return moment(year[25].day.dateYYYYMMDD).format('YYYY');
    }else{
      return '';
    }
  }

}
