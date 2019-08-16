import { Component, OnInit, Input } from '@angular/core';
import { DaybookDayItem } from '../../../api/daybook-day-item.class';
import { faCog, faEye } from '@fortawesome/free-solid-svg-icons';
import { TimelogService } from '../timelog.service';

@Component({
  selector: 'app-timelog-large',
  templateUrl: './timelog-large.component.html',
  styleUrls: ['./timelog-large.component.css']
})
export class TimelogLargeComponent implements OnInit {

  faCog = faCog;
  faEye = faEye;

  constructor(private timelogService: TimelogService) { }

  @Input() activeDay: DaybookDayItem;

  ngOnInit() {

  }


  public onMouseOverTimelog(){
    this._mouseOverTimelog = true;
  }
  public onMouseLeaveTimelog(){
    this._mouseOverTimelog = false;
  }

  private _mouseOverTimelog: boolean = false;
  public get mouseOverTimelog(): boolean{
    return this._mouseOverTimelog;
  }

  public onClickChangeView(view: string){
    this._viewMode = view;
  }

  private _viewMode: string = "timelog";
  public get viewMode(): string{
    return this._viewMode;
  }

}
