import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sdf-hour-count',
  templateUrl: './sdf-hour-count.component.html',
  styleUrls: ['./sdf-hour-count.component.css']
})
export class SdfHourCountComponent implements OnInit {

  constructor() { }
  private _count: number = 0;


  private _items: any[] = [];

  @Input() public set itemCount(count: number) { this._count = count; }
  public get items(): any[] { return this._items; }


  ngOnInit(): void {
    const items: any[] = [];

    let hours = this._count;
    const maxDiameterPx = 20;

    while (hours > 0) {
      if (hours > 1) {
        items.push({
          ngStyle: {
            'width': maxDiameterPx + 'px',
            'height': maxDiameterPx + 'px',
            'border-radius': maxDiameterPx + 'px',
            'background-color': 'rgba(0, 0, 255, 0.6)',
          }
        });
      } else if (hours < 1) {
        const diameterPx = (hours * maxDiameterPx).toFixed(0);
        items.push({
          ngStyle: {
            'width': diameterPx + 'px',
            'height': diameterPx + 'px',
            'border-radius': diameterPx + 'px',
            'background-color': 'rgba(0, 0, 255, 0.6)',
          }
        });
      }
      hours--;
    }
    for (let i = 0; i < this._count; i++) {
      items.push(i);
    }
    this._items = items;
    console.log("ITEMS IS ", this._items)
  }

}
