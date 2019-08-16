import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-day-structure-mode',
  templateUrl: './day-structure-mode.component.html',
  styleUrls: ['./day-structure-mode.component.css']
})
export class DayStructureModeComponent implements OnInit {

  constructor() { }

  ngOnInit() {



  }

  chartLabelLines: any[] = [
    {
      label: "8:00am",
      ngStyle: {
        "height":"33%",
      }
    },
    {
      label: "5:00pm",
      ngStyle: {
        "height": "75%",
      }
    }
  ];

}
