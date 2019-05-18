import { Component, OnInit, Input } from '@angular/core';
import { TimeViewsService } from './time-views.service';

@Component({
  selector: 'app-time-views',
  templateUrl: './time-views.component.html',
  styleUrls: ['./time-views.component.css']
})
export class TimeViewsComponent implements OnInit {

  constructor(private timeViewsService: TimeViewsService) { }



  @Input() timeViewData: any;

  timeView: string = "YEAR";
  // 'DAY', 'WEEK', 'SIX_WEEKS', 'YEAR', 'MULTIPLE_YEARS'

  ngOnInit() {
    this.timeViewsService.rangeChanged$.subscribe((range)=>{
      console.log("Range changed:", range);
    })
  }


  onClickZoom(zoomLevel: string){
    this.timeView = zoomLevel;
  }


}
