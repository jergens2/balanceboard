import { Injectable } from '@angular/core';
import { NavItem } from '../nav-item.model';
import { IHeaderMenu } from './header-menu/header-menu.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }


  activeBalanceBoardComponentMenu$: Subject<IHeaderMenu> = new Subject();

  setCurrentMenu(menu: IHeaderMenu){
    this.activeBalanceBoardComponentMenu$.next(menu);
  }


  
}
