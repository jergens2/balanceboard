import { Component, OnInit, Input } from '@angular/core';
import { IHeaderMenu } from './header-menu.interface';
import { NavItem } from '../../nav-item.model';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css']
})
export class HeaderMenuComponent implements OnInit {

  constructor() { }

  @Input() openMenu: IHeaderMenu;

  ngOnInit() {
    
  }

  onClickHeaderMenuItem(menuItem: NavItem){
    menuItem.onClick();
  }

}
