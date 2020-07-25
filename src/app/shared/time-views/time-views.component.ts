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
  private _currentView: 'WEEK' | 'MONTH' | 'YEAR' | 'SPECIFY' = 'MONTH';

  @Input() public set manager(manager: TimeViewsManager){
    this._manager = manager;
  }
  public get manager(): TimeViewsManager { return this._manager; }
  public get timeFrameMenu(): ButtonMenu { return this._timeFrameMenu; }
  public get viewIsMonth(): boolean { return this._currentView === 'MONTH'; }
  public get viewIsWeek(): boolean { return this._currentView === 'WEEK'; }
  public get viewIsYear(): boolean { return this._currentView === 'YEAR'; }
  public get viewIsSpecify(): boolean { return this._currentView === 'SPECIFY'; }

  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this._timeFrameMenu = new ButtonMenu();
    this._subscriptions = [
      this._timeFrameMenu.addItem$('Week').subscribe(s => this._selectTimeFrame('WEEK')),
      this._timeFrameMenu.addItem$('Month').subscribe(s => this._selectTimeFrame('MONTH')),
      this._timeFrameMenu.addItem$('Year').subscribe(s => this._selectTimeFrame('YEAR')),
      this._timeFrameMenu.addItem$('Specify').subscribe(s => this._selectTimeFrame('SPECIFY')),
    ];
    this._timeFrameMenu.openItem('Month');
    
  }

  private _selectTimeFrame(value: 'WEEK' | 'MONTH' | 'YEAR' | 'SPECIFY'){
    console.log("Setting current value: " , value);
    this._currentView = value;
  }

}
