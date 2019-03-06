import { Injectable } from '@angular/core';
import { MenuItem } from './header-menu/menu-item.model';
import { HeaderMenu } from './header-menu/header-menu.model';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }



  private _activeBalanceBoardComponentMenu: HeaderMenu = null;
  private _activeBalanceBoardComponentMenu$: Subject<HeaderMenu> = new Subject();
  public get activeBalanceBoardComponentMenu$(): Observable<HeaderMenu> { 
    return this._activeBalanceBoardComponentMenu$.asObservable();
  }

  setCurrentMenu(menu: HeaderMenu){
    this._activeBalanceBoardComponentMenu = menu;
    this._activeBalanceBoardComponentMenu$.next(this._activeBalanceBoardComponentMenu);
  }

  // private _closeMenus: Subject<boolean> = new Subject();
  // public get closeMenus$(): Observable<boolean> {
  //   return this._closeMenus.asObservable();
  // }
  // public closeMenus(value: boolean){
  //   console.log("Service: Closing Menus")
  //   this._closeMenus.next(value);
  // }
  
}
