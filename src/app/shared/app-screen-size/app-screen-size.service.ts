import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppScreenSize } from './app-screen-size.class';
import { AppScreenSizeLabel } from './app-screen-size-label.enum';

@Injectable({
  providedIn: 'root'
})
export class AppScreenSizeService {

  constructor() { }


  private _appScreenSize$: BehaviorSubject<AppScreenSize> = new BehaviorSubject(new AppScreenSize(window.innerWidth, window.innerHeight));

  public get appScreenSize$(): Observable<AppScreenSize> { return this._appScreenSize$.asObservable(); }
  public get appScreenSize(): AppScreenSize { return this._appScreenSize$.getValue(); }
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
    return appScreenSize;
  }

}
