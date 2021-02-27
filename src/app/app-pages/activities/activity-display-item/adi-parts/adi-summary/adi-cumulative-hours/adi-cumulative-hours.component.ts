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
  private _chartMenu: ButtonMenu;
  private _modeMenu: ButtonMenu;
  private _modeIsDuration: boolean = true;
  private _itemsAreCumulative: boolean = false;

  public get chartMenu(): ButtonMenu { return this._chartMenu; }
  public get modeMenu(): ButtonMenu { return this._modeMenu; }
  public get itemsAreCumulative(): boolean { return this._itemsAreCumulative; }

  public get isWeeklyChart(): boolean { return this.currentRange === 365; }
  public get isDailyChart(): boolean { return !this.isWeeklyChart; }

  public get chartItems(): ADIChartDisplayItem[] { return this._chartItems; }

  @Input() public currentRange: 7 | 30 | 90 | 365 | 'Specify' = 365;
  @Input() public set chartItems(items: ADIChartDisplayItem[]) {
    this._chartItems = items;
    this._reset();
  }



  ngOnInit(): void {
    this._modeIsDuration = true;
    this._itemsAreCumulative = false;


    this._chartMenu = new ButtonMenu();
    this._chartMenu.addItem$('Per Period').subscribe(s => this._setToPerPeriod());
    this._chartMenu.addItem$('Cumulative').subscribe(s => this._setToCumulative());
    this._chartMenu.openItem('Per Period');

    this._modeMenu = new ButtonMenu();
    this._modeMenu.addItem$('Duration').subscribe(s => this._setToDuration());
    this._modeMenu.addItem$('Occurrences').subscribe(s => this._setToOccurrences());
    this._modeMenu.openItem('Duration');


    this._reset();
  }

  private _setToDuration() {
    this._modeIsDuration = true;
    this._reset();
  }

  private _setToOccurrences() {
    this._modeIsDuration = false;
    this._reset();
  }

  private _setToCumulative() {
    this._itemsAreCumulative = true;
    this._reset();
  }
  private _setToPerPeriod() {
    this._itemsAreCumulative = false;
    this._reset();
  }

  private _reset() {
    this._chartItems.forEach(item => item.setTo(this._modeIsDuration, this._itemsAreCumulative));
  }

}
