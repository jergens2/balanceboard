import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderMenu } from './header-menu.model';
import { MenuItem } from './menu-item.model';
import { Router } from '@angular/router';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css']
})
export class HeaderMenuComponent implements OnInit {

  faChevronRight = faChevronRight;

  constructor(private router: Router) { }

  private mouseOverSubMenu: boolean = false;

  @Input() openMenu: HeaderMenu;
  // @Output() closeMenu: EventEmitter<HeaderMenu> = new EventEmitter<HeaderMenu>();


  ngOnInit() {

  }

  onClickHeaderMenuItem(menuItem: MenuItem) {
    
    if(this.mouseOverSubMenu){

    }else{
      menuItem.click();
      if (menuItem.routerLink != null && menuItem.routerLink != '') {
        this.router.navigate([menuItem.routerLink]);
      }
    }
    
    // this.headerService.closeMenus(true);
  }

  onMouseOverHeaderMenuItem(menuItem: MenuItem) {
    if (menuItem.subMenu) {
      menuItem.subMenu.isOpen = true;
    }

  }
  onMouseLeaveHeaderMenuItem(menuItem: MenuItem) {
    if (menuItem.subMenu) {
      menuItem.closeSubMenu();
    }
    // if (menuItem.subMenu) {
    //   menuItem.subMenu.isOpen = false;
    // }
    
  }

  onMouseOverSubMenu(){
    this.mouseOverSubMenu = true;
  }
  onMouseLeaveSubMenu(){
    this.mouseOverSubMenu = false;
  }


}