import { Injectable } from '@angular/core';
import { ScreenSizes } from './screen-sizes-enum';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {

  constructor() { }

  private _dimensions: BehaviorSubject<{width:number, height:number}> = new BehaviorSubject({width:0, height:0});
  public get dimensions$(): Observable<{width:number, height:number}> {
    return this._dimensions.asObservable();
  }
  public get dimensions(): {width:number, height:number} {1
    return this._dimensions.getValue();
  }

  private _appScreenSize$: BehaviorSubject<ScreenSizes> = new BehaviorSubject(ScreenSizes.NORMAL);
  public get appScreenSize$(): Observable<ScreenSizes> {
    return this._appScreenSize$.asObservable();
  }
  public get appScreenSize(): ScreenSizes {
    return this._appScreenSize$.getValue();
  }
  public updateSize(innerWidth: number, innerHeight:number): ScreenSizes{
    this._dimensions.next({width:innerWidth,height:innerHeight});
    let appScreenSize: ScreenSizes;
    if(innerWidth <= 400){
      appScreenSize = ScreenSizes.MOBILE;
    };
    if(innerWidth > 400 && innerWidth <= 768){
      appScreenSize = ScreenSizes.TABLET;
    } 
    if(innerWidth > 768 && innerWidth <= 1024){
      appScreenSize = ScreenSizes.NORMAL;
    }
    if(innerWidth > 1024 && innerWidth <= 1400){
      appScreenSize = ScreenSizes.LARGE;
    }
    if(innerWidth > 1400){
      appScreenSize = ScreenSizes.VERY_LARGE;
    }
    this._appScreenSize$.next(appScreenSize);
    return appScreenSize;
  }

}
