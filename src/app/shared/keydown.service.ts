import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeydownService {

  constructor() { }

  private _keyDown$: Subject<string> = new Subject();
  public get keyDown$(): Observable<string> { return this._keyDown$.asObservable(); }
  public keyDown(key: string) {
    this._keyDown$.next(key);
  }
}
