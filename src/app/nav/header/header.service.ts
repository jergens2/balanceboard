import { Injectable } from '@angular/core';
import { NavItem } from '../nav-item.model';
import { IHeaderMenu } from './header-menu/header-menu.interface';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }

  _activeBalanceboardComponentMenu: IHeaderMenu = null;



}
