import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent implements OnInit {

  today: Date = new Date();

  

  constructor() { }

  ngOnInit() {
  }

}
