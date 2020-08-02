import { Component, OnInit, Input } from '@angular/core';
import { ADIWeekDataChartItem } from '../adi-week-data-chart-item.class';
import { ButtonMenu } from '../../../../../../shared/components/button-menu/button-menu.class';

@Component({
  selector: 'app-adi-cumulative-hours',
  templateUrl: './adi-cumulative-hours.component.html',
  styleUrls: ['./adi-cumulative-hours.component.css']
})
export class AdiCumulativeHoursComponent implements OnInit {

  constructor() { }

  private _weekDataItems: ADIWeekDataChartItem[] = [];
  @Input() public set weekDataItems(data: ADIWeekDataChartItem[]){
    this._weekDataItems = data;
  }
  public get weekDataItems(): ADIWeekDataChartItem[] { return this._weekDataItems; }

  private _chartMenu: ButtonMenu;
  private _modeIsCumulative: boolean = false;
  public get chartMenu(): ButtonMenu { return this._chartMenu; }
  public get modeIsCumulative(): boolean { return this._modeIsCumulative; }

  ngOnInit(): void {
    this._chartMenu = new ButtonMenu();
    this._chartMenu.addItem$('Hours per week').subscribe(s => this._setToWeekly());
    this._chartMenu.addItem$('Cumulative hours').subscribe(s => this._setToCumulative());
    this._chartMenu.openItem('Hours per week');
  }

  private _setToCumulative(){
    this._modeIsCumulative = true;
    this._weekDataItems.forEach(item => item.toggleViewMode());
  }
  private _setToWeekly(){
    this._modeIsCumulative = false;
    this._weekDataItems.forEach(item => item.toggleViewMode());
  }

}
