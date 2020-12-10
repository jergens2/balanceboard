import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ActivityTreemapDataItem } from './activity-treemap-data-item.interface';

@Injectable({
  providedIn: 'root'
})
export class ActivityTreemapService {

  constructor() { }

  private _hoverItem$: Subject<ActivityTreemapDataItem> = new Subject();
  public get hoverItem$(): Observable<ActivityTreemapDataItem> { return this._hoverItem$.asObservable(); }

  public showItem(item: ActivityTreemapDataItem) {
    this._hoverItem$.next(item);
  }
  public removeItem() {
    this._hoverItem$.next(null);
  }
}
