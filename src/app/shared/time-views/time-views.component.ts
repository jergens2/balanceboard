import { Component, OnInit, Input } from '@angular/core';
import { TimeViewsManager } from './time-views-manager.class';
import { ButtonMenu } from '../components/button-menu/button-menu.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time-views',
  templateUrl: './time-views.component.html',
  styleUrls: ['./time-views.component.css']
})
export class TimeViewsComponent implements OnInit {

  constructor() { }
  
  private _manager: TimeViewsManager; 
  private _timeFrameMenu: ButtonMenu;


  @Input() public set manager(manager: TimeViewsManager){
    this._manager = manager;
  }
  public get manager(): TimeViewsManager { return this._manager; }
  public get timeFrameMenu(): ButtonMenu { return this._manager.timeFrameMenu; }
  public get viewIsMonth(): boolean { return this.currentView === 'MONTH'; }
  public get viewIsWeek(): boolean { return this.currentView === 'WEEK'; }
  public get viewIsYear(): boolean { return this.currentView === 'YEAR'; }
  public get viewIsSpecify(): boolean { return this.currentView === 'SPECIFY'; }

  public get currentView(): 'WEEK' | 'MONTH' | 'NINETY' | 'YEAR' | 'SPECIFY' { return this._manager.currentView; }

  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
  }

}
