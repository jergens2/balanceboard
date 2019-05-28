import { Injectable } from '@angular/core';
import { AppScreenSize } from './app-screen-size.enum';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SizeService {

  constructor() { }

  private _dimensions: BehaviorSubject<{width:number, height:number}> = new BehaviorSubject({width:0, height:0});
  public get dimensions$(): Observable<{width:number, height:number}> {
    return this._dimensions.asObservable();
  }
  public get dimensions(): {width:number, height:number} {
    return this._dimensions.getValue();
  }

  private _appScreenSize$: BehaviorSubject<AppScreenSize> = new BehaviorSubject(AppScreenSize.Normal);
  public get appScreenSize$(): Observable<AppScreenSize> {
    return this._appScreenSize$.asObservable();
  }
  public get appScreenSize(): AppScreenSize {
    return this._appScreenSize$.getValue();
  }
  public updateSize(innerWidth: number, innerHeight:number): AppScreenSize{
    this._dimensions.next({width:innerWidth,height:innerHeight});
    let appScreenSize: AppScreenSize;
    if(innerWidth <= 400){
      appScreenSize = AppScreenSize.Mobile;
    };
    if(innerWidth > 400 && innerWidth <= 768){
      appScreenSize = AppScreenSize.Tablet;
    } 
    if(innerWidth > 768 && innerWidth <= 1024){
      appScreenSize = AppScreenSize.Normal;
    }
    if(innerWidth > 1024){
      appScreenSize = AppScreenSize.Large;
    }
    this._appScreenSize$.next(appScreenSize);
    return appScreenSize;
  }

}
