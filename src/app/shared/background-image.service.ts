import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundImageService {

  constructor() { }

  private _ngClass$: BehaviorSubject<string[]> = new BehaviorSubject(['background-image-1']);
  public get ngClass$(): Observable<string[]> { return this._ngClass$.asObservable(); }
  public get ngClass(): string[] { return this._ngClass$.getValue(); }

  public getNewRandomImage() {
    const imageCount = 11;
    const random = Math.floor(Math.random() * imageCount) + 1;
    const backgroundImg: string = 'background-image-' + random;
    this._ngClass$.next([backgroundImg]);
  }


}
