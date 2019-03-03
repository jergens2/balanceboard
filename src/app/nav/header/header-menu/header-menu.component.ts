import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderMenu } from './header-menu.model';
import { MenuItem } from './menu-item.model';
import { Router } from '@angular/router';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { HeaderService } from '../header.service';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css']
})
export class HeaderMenuComponent implements OnInit {

  faChevronRight = faChevronRight;

  constructor(private router: Router, private headerService: HeaderService) { }

  @Input() openMenu: HeaderMenu;
  @Output() closeMenu: EventEmitter<HeaderMenu> = new EventEmitter<HeaderMenu>();


  ngOnInit() {

  }

  onClickHeaderMenuItem(menuItem: MenuItem) {


    /*
      onClick() will emit an event, which is subscribed to by the component,
      and the actual logic is executed by whichever component subscribes to the onClick()
      For example, in HeaderComponent, signout menu item subscription will execute signout method.
    */


    
    menuItem.onClick();
    if (menuItem.routerLink != null && menuItem.routerLink != '') {
      this.router.navigate([menuItem.routerLink]);
    }
    this.headerService.closeMenus(true);
  }

  onMouseOverHeaderMenuItem(menuItem: MenuItem) {
    if (menuItem.subMenu) {
      menuItem.subMenu.isOpen = true;
    }

  }
  onMouseLeaveHeaderMenuItem(menuItem: MenuItem) {
    if (menuItem.subMenu) {
      menuItem.subMenu.closeMenu();
    }
  }


}