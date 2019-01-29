import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class StylesService {


  constructor( private authService: AuthenticationService) { 

  }

  
  // private _nightMode: boolean = false;

  nightMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  
  // get nightMode(): boolean { 
  //   return this._nightMode;
  // }
  set nightMode(change: boolean){
    // this._nightMode = change;
    console.log("styles service: changing nightmode to ", change);
    this.nightMode$.next(change)
  }
}
