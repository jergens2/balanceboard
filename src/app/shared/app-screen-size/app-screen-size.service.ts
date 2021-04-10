import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppScreenSize } from './app-screen-size.class';
import { AppScreenSizeLabel } from './app-screen-size-label.enum';
import { UserAccountProfileService } from 'src/app/app-pages/user-account-profile/user-account-profile.service';

@Injectable({
  providedIn: 'root'
})
export class AppScreenSizeService {

  constructor(private profileService: UserAccountProfileService) { }


  private _appScreenSize$: BehaviorSubject<AppScreenSize> = new BehaviorSubject(new AppScreenSize(window.innerWidth, window.innerHeight));
  private _height$: BehaviorSubject<number> = new BehaviorSubject(window.innerHeight);
  private _width$: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

  public get appScreenSize$(): Observable<AppScreenSize> { return this._appScreenSize$.asObservable(); }
  public get appScreenSize(): AppScreenSize { return this._appScreenSize$.getValue(); }

  public get height$(): Observable<number> { return this._height$.asObservable(); }
  public get height(): number { return this._height$.getValue(); }
  public get width$(): Observable<number> { return this._width$.asObservable(); }
  public get width(): number { return this._width$.getValue(); }

  public get isSmallSize(): boolean { return this.appScreenSize.isSmallSize; }
  public get isMediumSize(): boolean { return this.appScreenSize.isMediumSize; }
  public get isFullSize(): boolean { return this.appScreenSize.isFullSize; }

  public get miniSidebarWidth(): number { return 70; }
  public get fullSidebarWidth(): number { return 225; }


  public get maxComponentWidthPX(): number { 
    if(this.isSmallSize){
      return this.width;
    }else if(this.isMediumSize){
      return this.width - this.miniSidebarWidth;
    }else if(this.isFullSize){
      if(this.profileService.appPreferences.sidebarIsPinned){
        return this.width - this.fullSidebarWidth;
      }else{
        return this.width - this.miniSidebarWidth;
      }
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
