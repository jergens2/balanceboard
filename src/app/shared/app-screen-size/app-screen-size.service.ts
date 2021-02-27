import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppScreenSize } from './app-screen-size.class';
import { AppScreenSizeLabel } from './app-screen-size-label.enum';

@Injectable({
  providedIn: 'root'
})
export class AppScreenSizeService {

  constructor() { console.log("screen size service init") }


  private _appScreenSize$: BehaviorSubject<AppScreenSize> = new BehaviorSubject(new AppScreenSize(window.innerWidth, window.innerHeight));
  private _height$: BehaviorSubject<number> = new BehaviorSubject(window.innerHeight);
  private _width$: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

  public get appScreenSize$(): Observable<AppScreenSize> { return this._appScreenSize$.asObservable(); }
  public get appScreenSize(): AppScreenSize { return this._appScreenSize$.getValue(); }

  public get height$(): Observable<number> { return this._height$.asObservable(); }
  public get height(): number { return this._height$.getValue(); }
  public get width$(): Observable<number> { return this._width$.asObservable(); }
  public get width(): number { return this._width$.getValue(); }

  public get isSmall(): boolean { return this.appScreenSize.isSmallSize; }

  public get maxComponentHeightPx(): number {
    if (this.appScreenSize.label !== AppScreenSizeLabel.MOBILE) {
      return (this.appScreenSize.height - 30)  //header is 30
    } else {
      return (this.appScreenSize.height);
    }
  }


  public get screenSizeNgClass(): string[] { return this.appScreenSize.ngClass; }

  public updateSize(innerWidth: number, innerHeight: number): AppScreenSize {
    // console.log("SIZE UPDATED: W, H: ", innerWidth, innerHeight)
    const appScreenSize: AppScreenSize = new AppScreenSize(innerWidth, innerHeight);
    this._appScreenSize$.next(appScreenSize);
    this._height$.next(innerHeight);
    this._width$.next(innerWidth);
    return appScreenSize;
  }

}
