import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAccountProfileService {

  constructor() { }

  public get allGood(): boolean { return true; }
}
