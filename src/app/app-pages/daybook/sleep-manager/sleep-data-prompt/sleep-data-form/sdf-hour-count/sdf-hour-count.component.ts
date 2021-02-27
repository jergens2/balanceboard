import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sdf-hour-count',
  templateUrl: './sdf-hour-count.component.html',
  styleUrls: ['./sdf-hour-count.component.css']
})
export class SdfHourCountComponent implements OnInit {

  constructor() { }
  private _count: number = 0;
  private _color: string = '';

  private _items: any[] = [];

  @Input() public set itemCount(count: number) {
    this._count = count;
    this._rebuild();
  }
  @Input() public set color(val: 'AWAKE' | 'ASLEEP') {
    if (val === 'AWAKE') {
      this._color = 'rgb(255, 179, 0)';
    } else if (val === 'ASLEEP') {
      this._color = 'rgba(0, 0, 255, 0.6)';
    }
  }
  public get items(): any[] { return this._items; }


  ngOnInit(): void {
    this._rebuild();

  }

  private _rebuild() {
    const items: any[] = [];
    let hours = this._count;
    const maxDiameterPx = 20;
    while (hours > 0) {
      if (hours >= 1) {
        items.push({
          ngStyle: {
            'width': maxDiameterPx + 'px',
            'height': maxDiameterPx + 'px',
            'border-radius': maxDiameterPx + 'px',
            'background-color': this._color,
          }
        });
        hours--;
      } else if (hours < 1) {
        const diameterPx = (hours * maxDiameterPx).toFixed(0);
        items.push({
          ngStyle: {
            'width': diameterPx + 'px',
            'height': diameterPx + 'px',
            'border-radius': diameterPx + 'px',
            'background-color': this._color,
          }
        });
        hours = 0;
      }
    }
    this._items = items;
  }

}
