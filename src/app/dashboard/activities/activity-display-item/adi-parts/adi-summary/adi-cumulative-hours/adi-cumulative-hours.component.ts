import { Component, OnInit, Input } from '@angular/core';
import { ADIChartDisplayItem } from '../adi-chart-display-item.class';
import { ButtonMenu } from '../../../../../../shared/components/button-menu/button-menu.class';

@Component({
  selector: 'app-adi-cumulative-hours',
  templateUrl: './adi-cumulative-hours.component.html',
  styleUrls: ['./adi-cumulative-hours.component.css']
})
export class AdiCumulativeHoursComponent implements OnInit {

  constructor() { }

  private _chartItems: ADIChartDisplayItem[] = [];
  @Input() public set chartItems(items: ADIChartDisplayItem[]) {
    this._chartItems = items;
    if (this._modeIsCumulative) {
      this._setToCumulative();
    } else if (!this._modeIsCumulative) {
      this._setToWeekly();
    }
  }
  public get chartItems(): ADIChartDisplayItem[] { return this._chartItems; }

  @Input() public currentRange: 7 | 30 | 90 | 365 | 'Specify' = 365;

  public get isWeeklyChart(): boolean { return this.currentRange === 365; }
  public get isDailyChart(): boolean { return !this.isWeeklyChart; }

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

  private _setToCumulative() {
    this._modeIsCumulative = true;
    this._chartItems.forEach(item => item.setToCumulative());
  }
  private _setToWeekly() {
    this._modeIsCumulative = false;
    this._chartItems.forEach(item => item.setToWeekly());
  }

}
