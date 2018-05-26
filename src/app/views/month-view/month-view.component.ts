import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css']
})
export class MonthViewComponent implements OnInit {


  viewBoxHeight = 600;
  viewBoxWidth = 800;

  daySquares = this.calculateDays();

  constructor() { }

  ngOnInit() {

  }

  calculateDays(): Object[] {
    let now: Date = new Date();
    let firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1 );
    let lastOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0);
    let columns = 7;
    let rows = Math.ceil((lastOfMonth.getDate()+firstOfMonth.getDay())/columns);

    let padding = 5;
    let dayWidth = (this.viewBoxWidth - (padding*(columns+1))) / columns;
    let dayHeight = (this.viewBoxHeight - (padding*(rows+1))) / rows;

    let daySquares: String[] = [];

    for(let row = 0; row < rows; row++){
      for(let col = 0; col < columns; col++){
        let x = padding + (col*dayWidth) + (col*padding);
        let y = padding + (row*dayHeight) + (row*padding);
        let path = 'M'+x+' '+y+
          ' L'+x+' '+(y+dayHeight)+
          ' L'+(x+dayWidth)+' '+(y+dayHeight)+
          ' L'+(x+dayWidth)+' '+y+
          ' Z'+
          ''
        
        daySquares.push(path);
      }
    }
    console.log(daySquares);

    return daySquares;
  }

}
